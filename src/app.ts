import express from 'express'

import dotenv from 'dotenv'
dotenv.config()
import config from 'config'
import log from './utils/logger'
import connectDB from './utils/db'
import { routes } from './routes'
import errorHandler from './middleware/errorHandler'
import fileUpload from 'express-fileupload'
const port = config.get<number>('port')

const app = express()


app.use(express.json())

app.use(routes)


app.use(errorHandler)
app.use(fileUpload())
app.listen(port,async()=> {
    log.info(`App is listening on port ${port}`)

    await connectDB()
})