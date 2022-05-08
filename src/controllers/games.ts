import ErrorResponse from "../utils/errorResponse";

import asyncHandler from "../middleware/async";

import GamestoreModel from "../Models/Gamestores";
import Games from "../Models/Games";
import { NextFunction, Request, Response } from "express";

// Get Games

//  @desc get all games

// @route GET 'api/v1/games
// @route GET 'api/v1/gamestores/:gamestoreId/games

// @access Public

const getGames = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // if there is a gamestore id in the request look for the gamestore that has that id

    if (req.params.gamestoreId) {
      const games = await Games.find({
        gamestore: req.params.gamestoreId,
      });

      return res.status(200).json({
        success: true,
        count: games.length,
        data: games,
      });
    } else {
      res.status(200).json(res.advancedResults);
    }
  }
);

// Get Game

//  @desc get single game

// @route GET 'api/v1/game
// @route GET 'api/v1/gamestores/:id

// @access Public

const getGame = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const game = await Games.findById(req.params.id).populate([]);

    // if the game is not found we return an error
    if (!game) {
      return next(
        new ErrorResponse(`No Game with the id of ${req.params.id}`, 404)
      );
    }

    // if a match is found,we return the gamestore
    res.status(200).json({
      success: true,
      data: game,
    });
  }
);

// Add Game

//  @desc Add a Game

// @route POST'api/v1/gamestores/gamestoreId/games

// @access Private

const createGame = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // adding the gamestore id to the request body

    req.body.gamestore = req.params.gamestoreId;
    req.body.user = req.user.id;

    console.log(req.body.gamestore);

    //  check to see if the specific gamestore exists
    const gamestore = await GamestoreModel.findById(req.params.gamestoreId);

    if (!gamestore) {
      return next(
        new ErrorResponse(
          `No Gamestore with the id of ${req.params.gamestoreId}`,
          404
        )
      );
    }

    // check if the user is the gamestore owner

    if (
      gamestore.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(
        new ErrorResponse(
          `User with ${req.user.id} is not authorized to add a game to gamestore ${gamestore._id}`,
          401
        )
      );
    }

    //   if all checks pass,create the game and store in db

    const game = await Games.create(req.body);

    // return data

    res.status(200).json({
      success: true,
      message: "Game successfully created",
      data: game,
    });
  }
);

// Update Game

//  @desc Update a Game

// @route PUT'api/v1/games/:id

// @access Private

const updateGame = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // search for game in db
    let game = await Games.findById(req.params.id);

    // if there is no match based on id return an error
    if (!game) {
      return next(
        new ErrorResponse(`No Game with the id of ${req.params.id}`, 404)
      );
    }
    // check if the user is the original publisher of the game

    if (game.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          `User with ${req.user.id} is not authorized to update game with id ${game.id}`,
          401
        )
      );
    }

    // if so the user is free to update the game and we return the response.

    game = await Games.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: game,
    });
  }
);

// Delete Game

//  @desc Delete a Game

// @route DELETE 'api/v1/games/:id

// @access Private
const deleteGame = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // search for game in db
    const game = await Games.findById(req.params.id);

    // if there is no match based on id return an error
    if (!game) {
      return next(
        new ErrorResponse(`No Game with the id of ${req.params.id}`, 404)
      );
    }
    // check if the user is the original publisher of the game

    if (game.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          `User with ${req.user.id} is not authorized to delete game with id ${game.id}`,
          401
        )
      );
    }

    // if so the user is free to update the game and we return the response which is an empty object.

    await Games.findByIdAndUpdate(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

export { createGame, getGames, getGame, updateGame, deleteGame };
