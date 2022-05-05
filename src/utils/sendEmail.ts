import nodemailer from 'nodemailer'
import config from 'config'
import asyncHandler from '../middleware/async'
import { NextFunction } from 'express'
export const sendEmail = async(options:any)=> {
    const transporter = nodemailer.createTransport({
        host:config.get<string>('smtp_host') ,
        port: config.get<number>('smtp_port'),
        auth: {
            user: config.get<string>('smtp_email'),
            pass:  config.get<string>('smtp_password')
        }


    })

    const fromEmail = config.get<string>('from_email')

    const fromName = config.get<string>('from_name')


    const message = {
        from: `${fromName} <${fromEmail}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    }


    const info = await transporter.sendMail(message)

    console.log("Message sent: %s", info.messageId);
}




