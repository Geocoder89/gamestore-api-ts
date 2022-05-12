import {model,Schema,Document} from 'mongoose'


import { UserDocument } from './User'

import { GamestoreDocument } from './Gamestores'


export interface Review extends Document{
    title: string;
    text: string;
    rating: number;
    user: UserDocument['_id']
    gamestore: GamestoreDocument['_id']
}


const ReviewSchema: Schema = new Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "Please add a title for the review"],
        maxlength: 100,
      },
      text: {
        type: String,
        required: [true, "Please add some text"],
      },
      rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, "Please add a rating between 1 and 10"],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      gamestore: {
        type: Schema.Types.ObjectId,
        ref: "Gamestore",
        required: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
},{
    timestamps: true
})


// enforces that a user only makes one review per gamestore and not multiple reviews on a gamestore.


ReviewSchema.index(
    {
        gamestore: 1,
        user: 1
    },
    {
        unique: true
    }
)


// Static method to get avg rating and save


ReviewSchema.statics.getAverageRating = async function(gamestoreId){
    // aggregation object

    const obj =await this.aggregate([
        {
            $match:{
                gamestore: gamestoreId
            }
        },
        {
            $group:{
                _id: '$gamestore',
                averageRating: { $avg: "$rating" },
            },
        }
    ])


    try {
        await model('Gamestore').findByIdAndUpdate(gamestoreId,{
            averageRating: obj[0].averageRating
        })
    } catch (error) {
        console.error(error)
    }
}


// Call getAverageRatings after save

ReviewSchema.post('save',async function(){
    await this.constructor.getAverageRating(this.gamestore)
})


//  Calculate getAverageRatings after save


ReviewSchema.post('remove',async function(){
    await this.constructor.getAverageRating(this.gamestore)
})


const ReviewModel = model('Review',ReviewSchema)


export default ReviewModel

