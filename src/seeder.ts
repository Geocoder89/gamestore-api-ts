import fs from 'fs'

import mongoose from 'mongoose'
import config from 'config'




// Load models


import userModel from './Models/User'


mongoose.connect(config.get<string>('mongodbUri'))


// read  JSON FILES

const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/Users.json`,'utf-8'))



// FUNCTION TO IMPORT DATA INTO DB

const importData = async()=> {
    try {
        await userModel.create(users)

        console.log(`Data imported....`)
        process.exit()
    } catch (error) {
        console.log(error)
    }

    
}


// FUNCTION TO DELETE DATA FROM THE DB


const deleteData = async()=> {
    try {
        await userModel.deleteMany()
        console.log('Data Destroyed.....')
        process.exit()
    } catch (error) {
        console.log(error)
    }
}


if(process.argv[2] === 'import'){
    importData()
} else if(process.argv[2] === 'delete') {
    deleteData()
}