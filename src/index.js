// require('dotenv').config({path:'./env'});

import dotenv from  'dotenv';
import connectDB from './db/index.js';
import app from "./app.js"; 

dotenv.config();

connectDB()
.then(()=>{
 app.listen(process.env.PORT || 8000,()=>{
    console.log(`running app on port ${process.env.PORT || 8000}`);
 })
})
.catch((err)=>{
    console.error('Database connection error:', err);
})















/*
import express from 'express';
const app = express();

; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on('error',(error)=>{
            console.error('Failed to connect to the database');
            throw error;
        })

app.listen(process.env.PORT,()=>{
    console.log(`running app on port ${process.env.PORT}`);
})

    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
})()
*/