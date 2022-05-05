
import ErrorResponse from '../utils/errorResponse'
import geocoder from '../utils/geocode'
import GamestoreModel from '../Models/Gamestores'
import asyncHandler from '../middleware/async'
import { NextFunction, Request, Response } from 'express'



//  @desc get all gamestores

// @route GET 'api/v1/gamestores

// @access Public



const getGamestores = asyncHandler(async(req: Request,res:Response,next:NextFunction)=>{
   return res.status(200).json(res.advancedResults)
  
})


const createGameStore = asyncHandler(async(req: Request,res:Response,next:NextFunction)=>{

    // Add user to the body
    req.body.user = req.user.id

    // check for published gamestore

    const publishedGamestore = await GamestoreModel.findOne({
        user: req.user.id
    })

    // if the user is not an admin they can only one gamestore

    if(publishedGamestore && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a gamestore`,400)
        )
    }

    // else we create the gamestore and store it into the db

    const gamestore = await GamestoreModel.create(req.body)

    res.status(201).json({
        success: true,
        message: 'Gamestore successfully created',
        data: gamestore
    })

})


export {getGamestores,createGameStore}