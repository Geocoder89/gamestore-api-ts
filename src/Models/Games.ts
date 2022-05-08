
import {model,Schema,Document} from 'mongoose'


import { UserDocument } from './User'
import { GamestoreDocument } from './Gamestores';

export interface GameDocument extends Document {
    user: UserDocument['_id'];
    title: string;
    description: string;
    releaseDate: number;
    price: number;
    minimumSkill: string;
    gamestore: GamestoreDocument['_id'];
    moneyBackGuarantee: boolean;
  
}






const GamesSchema:Schema = new Schema(
    {
        title: {
            type: String,
            trim: true,
            required: [true,"Please add a game title"]
        },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
  
    releaseDate: {
      type: Number,
      required: [true, "Please add the release Date of Game"],
    },
  
    price: {
      type: Number,
      required: [true, "Please add a Game price"],
    },
    minimumSkill: {
      type: String,
      required: [true, "Please add the minimum skill of the game"],
      enum: ["recruit", "beginner", "intermediate", "advanced"], //possible values that this field can only contain
    },
    moneyBackGuarantee: {
      type: Boolean,
      default: false,
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
  }, {
    timestamps: true
  }
  
  
  );


  GamesSchema.statics.getAverageSubscription = async function(gamestoreId) {

  
    
    // aggregation object
    const obj = await this.aggregate([
      {$match: 
        {gamestore: gamestoreId}
      },

      {
        $group: {
          _id: '$gamestore',
          averageSubscription: {$avg: "$price"}
        }
      }

    ])


    // aggregation query


    try {
      
      await model("Gamestore").findByIdAndUpdate(gamestoreId, {
        averageSubscription: Math.ceil(obj[0].averageSubscription / 10) * 10,
      });
    } catch (error) {
      console.error(error)
    }

    

    // 
  }



  // Call getAverageSubscription after save
  GamesSchema.post("save",function(){
    this.constructor.getAverageSubscription(this.gamestore)
  })


  // Calculate getAverageSubscription when removed
  GamesSchema.pre('remove',function() {
    this.constructor.getAverageSubscription(this.gamestore)
  })


  const Games = model<GameDocument>('Games',GamesSchema);

  export default Games;