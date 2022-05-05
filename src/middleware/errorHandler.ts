import { NextFunction, Request, Response } from "express";
import ErrorResponse from "../utils/errorResponse";
import {Error} from 'mongoose'
import { MongoError } from "mongodb";

const errorHandler = (err:any,req: Request,res: Response,next: NextFunction)=> {

    let error = {...err}

    error.message = err.message

    // Mongoose bad ObjectId
  if ((err as MongoError).name === "CastError") {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  else if ((err as MongoError).code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
   else if (err instanceof Error.ValidationError) {

    
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });

}

export default errorHandler