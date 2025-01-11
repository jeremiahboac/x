import express from 'express'
import { login, logout, signup } from '../controller/auth.controller.js'
import { catchAsync } from '../utils/catchAsync.js'

const router = express.Router()

router.post('/signup', catchAsync(signup))

router.post('/login', catchAsync(login))

router.post('/logout', logout)

export default router