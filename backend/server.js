import express from 'express'
import dotenv from 'dotenv'

import { errorHandler } from './utils/errorHandler.js'
import { connectDB } from './lib/mongodb.js'

import authRoutes from './routes/auth.route.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}.`)
  connectDB()
})