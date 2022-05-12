

import {Request,Response,NextFunction} from 'express'



// custom error Handler
import ErrorResponse from "../utils/errorResponse";

// async error handler
import asyncHandler from "../middleware/async";

// models

import ReviewModel from "../Models/Reviews";

import GamestoreModel from "../Models/Gamestores";

// Get Reviews

//  @desc get all Reviews

// @route GET 'api/v1/reviews
// @route GET 'api/v1/gamestores/:gamestoreId/reviews

// @access Public


const getReviews = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{

    // if there is a gamestoreId in the wildcard of req.params
    if(req.params.gamestoreId){
       
        // find the review that matches the id of the gamestore
       
        const reviews = await ReviewModel.find({gamestore: req.params.gamestoreId})

        return res.status(200).json({
            success: true,
            count: reviews.length
        })


    }
    // else we return all reviews
     else {
        res.status(200).json(res.advancedResults)
    }
})


//  @desc  Get a single review

// @route GET 'api/v1/reviews/:id

// @access Public


const getReview = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{
    const review = await ReviewModel.findById(req.params.id).populate({
        path: 'gamestore',
        select: 'name description'
    })

    // if the review is not found
    if(!review) {
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`,404))
    }

    //  else we return the review
    res.status(200).json({
        success: true,
        data: review
    })
})


//  @desc  Add a single review

// @route POST 'api/v1/gamestores/gamestoreId/review

// @access Private


const addReview = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{
    // we append the gamestore and user to what comes from the request body for the review


    req.body.gamestore = req.params.gamestoreId;

    req.body.user = req.user.id


    // we check to see if the gamestore exists,

    const gamestore = await GamestoreModel.findById(req.params.gamestoreId)

    // if not we throw an error message

    if(!gamestore) {
        return next(new ErrorResponse(`No gamestore found with the id of ${req.params.id}`,404))
    }

    // else we create a review for the gamestore

    const review = await ReviewModel.create(req.body)

    // return a created status back

    res.status(201).json({
        message: 'Review successfully added',
        data: review
    })
})


//  @desc  Update single review

// @route PUT 'api/v1/reviews/:id

// @access Private


const updateReview = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{
    // we find the review by it's id

    let review = await ReviewModel.findById(req.params.id)

    //  if the review id does not match we throw an error

    if(!review) {
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`,404))
    }

    // check if the user id actually belongs to the user or the user in question is an admin

    if(review.user.toString() !== req.user.id &&  req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to update this review`,401))
    }

    // if all checks pass,we update the review


    review = await ReviewModel.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators: true
    })

    // send back a response with the update review
    res.status(200).json({

        message: 'Review successfully updated',
        success: true,
        data: review
    })
})



//  @desc  Delete a single review

// @route DELETE 'api/v1/reviews/:id

// @access Private


const deleteReview = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{
    // we find the review by it's id

    const review = await ReviewModel.findById(req.params.id)

    // if not we throw an error message

    if(!review) {
        return next(
            new ErrorResponse(`No review with the id ${req.params.id}`,404)
        )
    }



     // check if the user id actually belongs to the user or the user in question is an admin

     if(review.user.toString() !== req.user.id &&  req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to update this review`,401))
    }

    // if all checks pass we can then delete the review for the gamestore


    await review.remove()

    res.status(200).json({
        success: true,
        message: 'Review succesfully deleted',
        data: {}
    })
})





export {getReviews,getReview,addReview,updateReview,deleteReview}