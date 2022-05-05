import express from 'express'
import { forgotPassword, getMe, loginUser, logoutUser, registerUser, resetPassword, updateDetails, updatePassword } from '../../controllers/user'
import { protectRoute } from '../../middleware/auth'


export const userRouter = express.Router()


userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/logout',logoutUser)
userRouter.post('/forgot-password',forgotPassword)
userRouter.put("/resetPassword/:resettoken",resetPassword)
userRouter.get('/me',protectRoute,getMe)
userRouter.put('/updatedetails',protectRoute,updateDetails)
userRouter.put('/updatePassword',protectRoute,updatePassword)