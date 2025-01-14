import express from 'express'

import { protectRoute } from '../middleware/auth.middleware.js'
import { catchAsync } from '../utils/catchAsync.js'

import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUser } from '../controller/user.controller.js'

const router = express.Router()

router.get('/profile/:username', protectRoute, catchAsync(getUserProfile))
router.get('/suggested', protectRoute, catchAsync(getSuggestedUsers))
router.post('/follow/:id', protectRoute, catchAsync(followUnfollowUser))
router.patch('/update', protectRoute, catchAsync(updateUser))

export default router