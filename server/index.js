import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import userRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'
import listingRouter from './routes/listing.route.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

dotenv.config()

const app = express()

app.use(cors({
    origin: 'http://localhost:5173',  // Allow only this origin
    methods: ['GET', 'POST'],  // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Specify allowed headers
    credentials: true,  // Allow cookies to be sent
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(cookieParser())
app.use(express.json())


mongoose.connect(process.env.MONGO_URI)

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})

app.use('/api/user', userRouter)
app.use('/api/auth', authRouter)
app.use('/api/listing', listingRouter)

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({ 
        success: false,
        statusCode,
        message
    });
})