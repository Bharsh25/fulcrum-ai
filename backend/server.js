import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'node:dns';  ///DNS RESOLVING
dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();
import chatRoutes from './Routes/chat.js';
import authRoutes from "./Routes/auth.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', chatRoutes);

app.use("/api/auth", authRoutes);

app.listen(8080, () => {
    console.log(`Server is running on port ${8080}`);
    connectDB();
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }   
}



