import ErrorResponse from "../utils/errorResponse";
import geocoder from "../utils/geocode";
import GamestoreModel from "../Models/Gamestores";
import asyncHandler from "../middleware/async";
import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import config from "config";
import path from "path";

//  @desc get all gamestores

// @route GET 'api/v1/gamestores

// @access Public

const getGamestores = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json(res.advancedResults);
  }
);

//  @desc get single gamestore

// @route GET 'api/v1/gamestore/:id

// @access Public
const getSingleGamestore = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const gamestore = await GamestoreModel.findById(req.params.id);

    // to check if the gamestore is correctly formatted but does not exist in the database

    if (!gamestore) {
      return next(
        new ErrorResponse(
          `Gamestore not found with id of ${req.params.id}`,
          404
        )
      );
    }

    // else return the found gamestore

    res.status(200).json({
      success: true,
      data: gamestore,
    });
  }
);

//  @desc Create a gamestore

// @route POST'api/v1/gamestores

// @access Private

const createGameStore = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Add user to the body
    req.body.user = req.user.id;

    // check for published gamestore

    const publishedGamestore = await GamestoreModel.findOne({
      user: req.user.id,
    });

    // if the user is not an admin they can only one gamestore

    if (publishedGamestore && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          `The user with ID ${req.user.id} has already published a gamestore`,
          400
        )
      );
    }

    // else we create the gamestore and store it into the db

    const gamestore = await GamestoreModel.create(req.body);

    res.status(201).json({
      success: true,
      message: "Gamestore successfully created",
      data: gamestore,
    });
  }
);

//  @desc Update a gamestore

// @route PUT 'api/v1/gamestore/:id

// @access Private

const updateGamestore = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // find the particular gamestore
    let gamestore = await GamestoreModel.findById(req.params.id);

    if (!gamestore) {
      return next(
        new ErrorResponse(`Gamestore not found with id ${req.params.id}`, 404)
      );
    }

    // check to be sure the user owns the gamestore or is an admin

    if (
      gamestore.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(
        new ErrorResponse(
          `User with ${req.params.id} is not authorized to update this gamestore`,
          401
        )
      );
    }

    // else we can update the gamestore

    gamestore = await GamestoreModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    // return the updated gamestore

    res.status(200).json({
      success: true,
      message: "Gamestore successfully updated",
      data: gamestore,
    });
  }
);

//  @desc Delete a gamestore

// @route DELETE 'api/v1/gamestore/:id

// @access Private

const deleteGamestore = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // find the gamestore
    const gamestore = await GamestoreModel.findById(req.params.id);

    if (!gamestore) {
      return next(
        new ErrorResponse(`Gamestore not found with id ${req.params.id}`, 404)
      );
    }

    // check to be sure the user owns the gamestore or is an admin

    if (
      gamestore.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(
        new ErrorResponse(
          `User with ${req.params.id} is not authorized to update this gamestore`,
          401
        )
      );
    }

    // else remove the gamestore from the db

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

// @desc Get bootcamps within a radius

// @route GET /api/v1/gamestores/radius/:zipcode/:distance

const getGamestoreByRadius = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { zipcode, distance } = req.params;

    // get latitude and longitude from geocoder

    const location = await geocoder.geocode(zipcode);
    const latitude = location[0].latitude;
    const longitude = location[0].longitude;

    // calculate radius in radians by dividing the distance by the radius of the earth which is 6378km

    const radius: number = +distance / 6378;

    // find all gamestore within the geographic vicinity with the longitude,latitude and the radius

    const gamestores = await GamestoreModel.find({
      location: {
        $geowithin: { $centerSphere: [[longitude, latitude], radius] },
      },
    });

    // return all the  gamestores available

    res.status(200).json({
      success: true,
      count: gamestores.length,
      data: gamestores,
    });
  }
);

const gamestorePhotoUpload = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const gamestore = await GamestoreModel.findById(req.params.id);

    if (!gamestore) {
      return next(
        new ErrorResponse(
          `Gamestore not found with id of ${req.params.id}`,
          404
        )
      );
    }

    // check if current user is the bootcamp owner

    if (
      gamestore.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(
        new ErrorResponse(
          `User with ${req.params.id} is not authorized to update this Gamestore`,
          401
        )
      );
    }

    // check if the file was uploaded

    if (!req.files) {
      return next(new ErrorResponse(`Please upload a file`, 400));
    }

    // find the file

    const file = req.files.File as UploadedFile;

    if (!file.mimetype.startsWith("image")) {
      return next(new ErrorResponse(`Please an upload an image`, 400));
    }

    // to set or check for a file size

    if (file.size > config.get<number>("max_file_upload")) {
      return next(
        new ErrorResponse(
          `Please upload an image of less than ${config.get<number>(
            "max_file_upload"
          )}`,
          400
        )
      );
    }

    // create a custom filename

    file.name = `photo_${gamestore._id}${path.parse(file.name).ext}`;

    // to move the files to a specific directory

    file.mv(
      `${config.get<string>("file_upload_path")}/${file.name}`,
      async (err) => {
        // if there is an error,handle the error
        if (err) {
          console.error(err);

          return next(new ErrorResponse(`Problem with file Upload`, 500));
        }

        // else we append the moved image to the existing gamestore via an update

        await GamestoreModel.findByIdAndUpdate(req.params.id, {
          photo: file.name,
        });

        res.status(200).json({
          success: true,
          data: file.name,
        });
      }
    );
  }
);

export {
  getGamestores,
  createGameStore,
  getSingleGamestore,
  updateGamestore,
  deleteGamestore,
  getGamestoreByRadius,
  gamestorePhotoUpload,
};
