import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const app = express()

mongoose.connect(process.env.MONGO_URI,)

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})