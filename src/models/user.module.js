import mongoose, { Schema, trusted } from "mongoose";
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
avater:{
    type:String, // cloudinary image url
    required:true,
},
coverImage:{
    type:String,// cloudinary image url
},
watchHistory:[
    {
        type:Schema.Type.ObjectId,
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


userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
   this.password = await bcrypt.hash(this.password,10)
   next();
})

userSchema.methods.ispasswordValid = async function(password)
{
return await bcrypt.compare(password,this.password)
}

UserSchema.methods.generateAccessToken = function(){
jwt.sign(
    {
        _id:this.id,
        username:this.username,
        email:this.email,
        fullName:this.fullName
    },
    procedd.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

UserSchema.methods.generateRefreshToken = function(){
    jwt.sign(
    {
        _id:this.id,
        username:this.username,
        email:this.email,
        fullName:this.fullName
    },
    procedd.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}
export const User = mongoose.model("User", userSchema);
