import express from 'express'

import { protectRoute } from '../middleware/auth.middleware.js'
import { commentOnPost, createPost, deletePost, getAllPosts, getFollowingPosts, getLikedPost, getUserPosts, likeUnlikePost } from '../controller/post.controller.js'
import { catchAsync } from '../utils/catchAsync.js'

const router = express.Router()

router.get('/all', protectRoute, catchAsync(getAllPosts))
router.get('/following', protectRoute, catchAsync(getFollowingPosts))
router.get('/likes/:id', protectRoute, catchAsync(getLikedPost))
router.get('/user/:username', protectRoute, catchAsync(getUserPosts))
router.post('/create', protectRoute, catchAsync(createPost))
router.patch('/like/:id', protectRoute, catchAsync(likeUnlikePost))
router.patch('/comment/:id', protectRoute, catchAsync(commentOnPost))
router.delete('/:id', protectRoute, catchAsync(deletePost))

export default router