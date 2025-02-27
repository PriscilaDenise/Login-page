import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from './routes/auth.routes.js';


dotenv.config();

const app = express();

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], // Allow both localhost and 127.0.0.1
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT;

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running in the port ${PORT}`);
    console.log("JWT Secret:", process.env.JWT_SECRET);
});

