import mongoose from 'mongoose'
import config from 'config'
import log from './logger'


const connectDB = async()=> {

    // get the mongodb uri 
    const mongoDbUri= config.get<string>('mongodbUri')


    

    try {

        // try to connect to mongoose using the uri
        const connection = await mongoose.connect(mongoDbUri)
        
        log.info(`Database connected on: ${connection.connection.host}`)
        
    } catch (error) {

        // if it fails we log the specific error
        log.info(error)
        // log a friendly error
        log.error('Could not connect to the db')

        // we exit the process
        process.exit(1)


}


}

export default connectDB