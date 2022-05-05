import jwt, { JwtPayload } from 'jsonwebtoken'
import ErrorResponse from '../utils/errorResponse'
import userModel from '../Models/User'
import config from 'config'
import asyncHandler from './async'
import { NextFunction, Request, Response } from 'express'
import { JwtToken } from '../interfaces/token'




// middleware to protect routes


const protectRoute = asyncHandler(async(req: Request,res: Response,next: NextFunction)=> {
    let token;

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer") 
    ) {
            token = req.headers.authorization.split(" ")[1]
    }

    else if (req.cookies.token) {
        token = req.cookies.token
    }


    // make sure if token exists

    if(!token) {
        return next(new ErrorResponse(`Not Authorized to access the route`,401))
    }

    try {
        // verify token

        const decodedToken = jwt.verify(token,config.get<string >('jwt_secret')) as JwtToken

        req.user = await userModel.findById(decodedToken.id)

        next();



    } catch(err) {
        console.log(err)
        return next(new ErrorResponse(`Not Authorized to access this route`,401))
    }
    
})

const authorize = (...roles:string[])=> {
    return (req:Request,res: Response,next:NextFunction)=>{
        if(!roles.includes(req.user.role as string)){
            return next(new ErrorResponse(
                `User with the role ${req.user.role} is not authorized`,403
            ))
        }


        next()
    }
}

export {protectRoute,authorize}