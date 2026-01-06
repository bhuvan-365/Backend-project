import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    
username:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true
},
email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
},
fullName:{
    type:String,
    required:true,
    trim:true,
    index:true
},
avatar:{
    type:String, // cloudinary image url
    required:true,
},
coverImage:{
    type:String,// cloudinary image url
},
watchHistory:[
    {
        type:Schema.Types.ObjectId,
        ref:"Video"
    }
],
password:{
    type: String,
      required:[true, "Password is required"],
},
refreshTokens:{
    type: String,
}

},{
    timestamps:true
});

//hash password before saving user document
// userSchema.pre("save", async function(next){
//     if(!this.isModified("password")) return next();
//    this.password = await bcrypt.hash(this.password,10)
//    next();
// })
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.ispasswordValid = async function(password)
{
return await bcrypt.compare(password,this.password)
}

//Generate JWT Tokens
userSchema.methods.generateAccessToken = function(){
return jwt.sign(
    {
        _id:this.id,
        username:this.username,
        email:this.email,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
//Generate JWT Tokens
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
    {
        _id:this.id,
        username:this.username,
        email:this.email,
        fullName:this.fullName
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}
export const User = mongoose.model("User", userSchema);
