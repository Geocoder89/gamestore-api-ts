
import {Response} from 'express'
import { UserDocument } from '../Models/User'
import config from 'config'

const sendTokenResponse = (user: UserDocument, statusCode: number,res:Response)=> {

    // create token 

    const token = user.getSignedJwtToken()

    // cookie options = 
    const options = {
        expires: new Date(Date.now() + parseInt(config.get<string>('jwt_expire'))* 24 *60 *60 * 1000),

        httpOnly: true,
        secure: false
    }


    console.log(options.expires)


    if(config.get<string>('node_env') === 'production') {
        options.secure = true
    }

    res.status(statusCode).cookie('token',token,options).json({
        success: true,
        token,
        options
    })

}

export default sendTokenResponse
