import ErrorResponse from "../utils/errorResponse";

import asyncHandler from "../middleware/async";

import GamestoreModel from "../Models/Gamestores";
import Games from "../Models/Games";
import { NextFunction, Request, Response } from "express";





const createGame = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
// adding the gamestore id to the request body

req.body.gamestore = req.params.gamestoreId;
req.body.user = req.user.id

console.log(req.body.gamestore)


//  check to see if the specific gamestore exists
const gamestore = await GamestoreModel.findById(req.params.gamestoreId)

if(!gamestore) {
    return next(new ErrorResponse(`No Gamestore with the id of ${req.params.gamestoreId}`,404))
}


// check if the user is the gamestore owner

if (gamestore.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with ${req.user.id} is not authorized to add a game to gamestore ${gamestore._id}`,
        401
      )
    );
  }

//   if all checks pass,create the game and store in db

const game = await Games.create(req.body)


// return data


res.status(200).json({
    success: true,
    message: 'Game successfully created',
    data: game
})
})


export {createGame}