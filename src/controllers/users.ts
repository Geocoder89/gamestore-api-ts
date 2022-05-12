/* 

these are endpoints for admins to do crud operations to create,read,update and delete users

*/

import ErrorResponse from "../utils/errorResponse";

import asyncHandler from "../middleware/async";

import {Request,Response,NextFunction} from 'express'

import userModel from "../Models/User";




//  @desc Get all users

// @route GET 'api/v1/auth/users

// @access Private/admin


const getUsers = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{
    res.status(200).json(res.advancedResults)
})



//  @desc Get single user

// @route POST 'api/v1/auth/users/:id

// @access Private/admin

const getUser = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{

    // find the user in the db
    const user = await userModel.findById(req.params.id)

    // if user is not found throw an error 

    if(!user){
        return next(new ErrorResponse(`User with id ${req.params.id} was not found`,404))
    }

    // else we return the user which matches with a success response
    res.status(200).json({
        success: true,
        data: user
    })
})



//  @desc create user

// @route POST 'api/v1/auth/users

// @access Private/admin

const createUser = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{
 
    // we simply create a user as we have validations on the model and also middleware to confirm the logged on user has admin permissions
    const user = await userModel.create(req.body)


    // we return the created user with an appropriate response
    res.status(201).json({
        success: true,
        data: user
    })
})


const updateUser = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{
    
    // we find the user in the db
     let user = await userModel.findById(req.params.id)

    //  if we do not find the user in the db we throw a not found error
     if(!user) {
         return next(new ErrorResponse(`No user found with id ${req.params.id}`,404))
     }


        // we simply update a user as we have validations on the model and also middleware to confirm the logged on user has admin permissions
      user = await userModel.findByIdAndUpdate(req.params.id,req.body,{
          new: true,
          runValidators: true
      })

    //   we return the updated user with the appropriate response


    res.status(200).json({
        success: true,
        message: 'User successfully created',
        data: user
    })
})

const deleteUser = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{

    // find user in db

    const user = await userModel.findById(req.params.id)

    if(!user) {
        return next(new ErrorResponse(`User not found with id ${req.params.id}`,404))
    }

    // else if found we remove the user and return an appropriate response

    user.remove()
    res.status(200).json({
        success: true,
        data: {}
    })
})

export {getUsers,getUser,createUser,updateUser,deleteUser}