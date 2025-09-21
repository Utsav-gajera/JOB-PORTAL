import "./config/instrument.js"
import express from 'express';
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js';
import * as Sentry from "@sentry/node";
import { ClerkWebhook } from "./controllers/webhooks.js";
import bodyParser from "body-parser";
import companyRoutes from './routes/companyRoutes.js';
import connectCloudinary from "./config/cloudinary.js";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { clerkMiddleware } from "@clerk/express";



// initialize express

const app = express();

//connect to database

await connectDB();

await connectCloudinary();

//middlewares

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

app.post('/webhooks', bodyParser.raw({ type: "application/json" }), ClerkWebhook);
app.use('/api/company', companyRoutes);
app.use('/api/jobs',jobRoutes);
app.use('/api/user',userRoutes);



//routes

app.get('/',(req,res)=>res.send('API is running'))
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});


//port

const PORT = process.env.PORT || 5000;

Sentry.setupExpressErrorHandler(app);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});