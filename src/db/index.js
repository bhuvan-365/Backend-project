import mongoose from "mongoose";
import { DB_NAME } from "../constant";

const connectDB = async () => {
    try{

const connection =  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
console.log(`Database connected successfully ${connection.connection.host}`);

    }catch (err){
        console.error('Database connection error:', err);
        // throw err;
        process.exit(1);
    }
}

export default connectDB;