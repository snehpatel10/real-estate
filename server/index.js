import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import userRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'

dotenv.config()

const app = express()
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})

app.use('/api/user', userRouter)
app.use('/api/auth', authRouter)