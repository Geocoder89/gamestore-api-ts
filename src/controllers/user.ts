import crypto from 'crypto'
import ErrorResponse from '../utils/errorResponse'
import asyncHandler from '../middleware/async'
import userModel from '../Models/User'
import { NextFunction, Request, Response } from 'express'
import sendTokenResponse from '../utils/sendTokenResponse'
import { sendEmail } from '../utils/sendEmail'
import log from '../utils/logger'


//  @desc Register User

// @route POST 'api/v1/auth/register

// @access Public




const registerUser = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{

    const {name,email,password,role} = req.body;


    // create and save user

    const user = await userModel.create({
        name,
        email,
        password,
        role
    })

    // set cookie
    sendTokenResponse(user,201,res)

   
})



//  @desc Login User

// @route POST 'api/v1/auth/login

// @access Public

const loginUser = asyncHandler(async(req: Request,res:Response,next:NextFunction)=>{
    const {email,password} = req.body

    // validate email and password


    if(!email|| !password) {
        return next(new ErrorResponse('Please a provide a valid email and password',400))
    }


    // check for user
    
    const user = await userModel.findOne({email}).select('+password')

    // if not user you throw an error

    if(!user) {
        return next(new ErrorResponse('Invalid credentials',401))
    }


    // checks if the password matches

    const isMatch = await user.matchPassword(password)


    // throw an error if it does not
    if(!isMatch) {
        return next(new ErrorResponse('Invalid Credentials',401))
    }


    // set cookie

    sendTokenResponse(user,200,res)
})


//  @desc Logout out current user /clear cookie

// @route GET 'api/v1/auth/logout

// @access Private

const logoutUser = asyncHandler(async(req:Request,res:Response,next: NextFunction)=> {
    
    // set the cookie to null
    res.cookie("token","none",{
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    })

    // set the response

    res.status(200).json({
        success: true,
        data: {},
        message: 'User Logged out successfully'
    })
})




//  @desc Forgot Password

// @route POST 'api/v1/auth/forgotpassword

// @access Private

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public



const forgotPassword = asyncHandler(async(req: Request,res: Response,next: NextFunction)=> {
    // look for user in the database

    const user = await userModel.findOne({email: req.body.email})


    if(!user){
        return next(new ErrorResponse('There is no user with that email',404))
    }

    // get the reset token

    const resetToken = user.getResetPasswordToken()


    await user.save({ validateBeforeSave: false });
    //  create the reset url

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        })

        res.status(200).json({
            success: true,
            data: "Email sent"
        })
    } catch(err) {
        log.info(err)
        user.resetPasswordExpirationDate = undefined;

        user.resetPasswordToken = undefined;

        await user.save({
            validateBeforeSave: false
        })
    
        return next(new ErrorResponse("Email could not be sent", 500));
    }
})


//  @Gdesc Reset Password
// @route PUT 'api/v1/auth/resetpassword/:resetToken

// @access Private

const resetPassword = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{

    const resetPasswordToken: string = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')

    // this is to check if the expiration date is greater than present time.
    const user = await userModel.findOne({
        resetPasswordToken,
        resetPasswordExpirationDate: {$gt: Date.now()}
    })

    if(!user) {
        return next(new ErrorResponse(`Invalid Token`,400))
    }

    // if user exists set new password

    user.password = req.body.password;


    // we then set the resetPasswordToken and expiration to undefined

    user.resetPasswordToken = undefined;
    user.resetPasswordExpirationDate = undefined;

    // we resave the user


    await user.save()
    sendTokenResponse(user,200,res)
})


const getMe = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{
    const user = req.user;

    res.status(200).json({
        success: true,
        data: user
    })


})


const updateDetails = asyncHandler(async(req:Request,res: Response,next: NextFunction)=> {

    const {name,email} = req.body
    const fieldsToUpdate = {
        name,
        email
    }
    const user = await userModel.findByIdAndUpdate(req.user.id,fieldsToUpdate,{
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: user
    })
})


const updatePassword = asyncHandler(async(req: Request,res: Response,next: NextFunction)=>{
    const user = await userModel.findById(req.user.id).select('+password')


    const {currentPassword,newPassword} = req.body
    // check current password

    if(!await user!.matchPassword(currentPassword)){
        return next(new ErrorResponse(`Password is incorrect`,401))
    }

    user!.password = newPassword

    await user!.save()

    sendTokenResponse(user!,200,res)
})


export {registerUser,loginUser,logoutUser,forgotPassword,resetPassword,getMe,updateDetails,updatePassword}