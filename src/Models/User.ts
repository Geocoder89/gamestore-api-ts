import crypto from 'crypto'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import config from 'config'

export interface UserDocument extends mongoose.Document {
    name: string;
    email: string;
    role: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpirationDate?: number;
    matchPassword(enteredPassword: string):Promise<boolean>;
    getSignedJwtToken():string

    getResetPasswordToken():string

}

const UserSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
  
    email: {
      type: String,
      required: [true, "please add an email address"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
  
    role: {
      type: String,
      enum: ["user", "publisher"],
      default: "user",
    },
  
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: 6,
      // this hides the password
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpirationDate: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  

//   encrypt the password using bcrypt

UserSchema.pre('save',async function(next){
    let user = this as UserDocument

    if(!user.isModified('password')) {
        next()
    }

    // to generate the salt rounds
    const salt = await bcrypt.genSalt(10)

    // hash the salt based on the salt rounds

    user.password = await bcrypt.hash(user.password,salt)
})


//  sign JWT and return

UserSchema.methods.getSignedJwtToken = function() {

    const JWT_SECRET = config.get<string>('jwt_secret')
    const expiresIn = config.get<string>('jwt_expire')
    return jwt.sign(
        {
        id: this._id
    },

    JWT_SECRET,
    {
        expiresIn
    },



    
    )
}

// match user entered password to the hashed password in database

UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    let user = this as UserDocument
    return await bcrypt.compare(enteredPassword,user.password)
}


// Generate and hash password Reset token


UserSchema.methods.getResetPasswordToken = function () {

  const user = this as UserDocument
  const resetToken = crypto.randomBytes(20).toString('hex')

  // hash token and set to resetPasswordToken field

  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')


  // set expires field

  user.resetPasswordExpirationDate = Date.now() +10 * 60 * 60 * 1000

  return resetToken
}



const userModel = mongoose.model<UserDocument>('User',UserSchema)

export default userModel
