import express from 'express'
import { getMe, login, logout, signup } from '../controller/auth.controller.js'
import { catchAsync } from '../utils/catchAsync.js'
import { protectRoute } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/me', protectRoute, catchAsync(getMe))

router.post('/signup', catchAsync(signup))

router.post('/login', catchAsync(login))

router.post('/logout', logout)

export default router