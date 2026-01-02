import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
 
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit:"16kb"})); // for parsing application/json size
app.use(express.urlencoded({extended:true, limit:"16kb"})); // for parsing application/x-www-form-urlencoded
app.use(express.static("public")) // to serve static files from the "public" directory
app.use(cookieParser()); // to parse cookies from the request headers

//routes
import userRouter from "./routes/user.routes.js";

//route declarations
app.use("/api/v1/users", userRouter);

export default app;