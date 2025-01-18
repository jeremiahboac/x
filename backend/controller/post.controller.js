import { v2 as cloudinary } from "cloudinary"

import Post from "../models/post.model.js"
import { AppError } from "../utils/errorHandler.js"

import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"

export const createPost = async (req, res, next) => {
  const { text } = req.body
  const { img } = req.body

  const userId = req.user._id.toString()

  if (!userId) throw new AppError(404, 'User not found')

  if (!text && !img) throw new AppError(400, 'Post must have text or image')

  if (img) {
    const uploadedImg = await cloudinary.uploader.upload(img, { folder: 'x_posts' })

    img = uploadedImg.secure_url
  }

  const newPost = await Post.create({ user: userId, text, img })

  res.status(201).json({ success: true, message: 'Post created successfully', data: { newPost } })
}

export const deletePost = async (req, res, next) => {
  const { id } = req.params

  const userId = req.user._id.toString()

  const post = await Post.findById(id)

  if (!post) throw new AppError(404, 'Cannot delete non-existent post')

  if (post.user.toString() !== userId) throw new AppError(401, 'You are not authorized to delete this post')

  if (post.img) await cloudinary.uploader.destroy(post.img.split('/').pop().split('.')[0])

  await Post.findByIdAndDelete(id)

  res.status(200).json({ success: true, message: 'Post deleted successfully' })
}

export const commentOnPost = async (req, res, next) => {
  const { id } = req.params

  const { text } = req.body

  const userId = req.user._id.toString()

  if (!text) throw new AppError(400, 'Comment cannot be empty')

  const post = await Post.findById(id)

  if (!post) throw new AppError(404, 'Cannot comment on non-existent post')

  const comment = await Post.findByIdAndUpdate(id, { $push: { comments: { text, user: userId } } }, { new: true })

  res.status(200).json({ success: true, message: 'Comment added successfully', data: { post: comment } })
}

export const likeUnlikePost = async (req, res, next) => {
  const { id } = req.params
  const userId = req.user._id

  let message

  const post = await Post.findById(id)

  if (!post) throw new AppError(404, 'Cannot like/unlike non-existent post')

  if (post.likes.includes(userId.toString())) {
    post.likes = post.likes.filter(like => like.toString() !== userId.toString())

    await User.findByIdAndUpdate({ _id: userId }, { $pull: { likedPosts: id } })

    message = 'Post unliked successfully'
  } else {
    post.likes.push(userId)

    await User.findByIdAndUpdate({ _id: userId }, { $push: { likedPosts: id } }, { new: true })

    await Notification.create({ type: 'like', from: userId, to: post.user })

    message = 'Post liked successfully'
  }

  await post.save()

  res.status(200).json({ success: true, message, data: { post } })
}

export const getAllPosts = async (req, res, next) => {
  const posts = await Post.find({}).sort({ createdAt: -1 })
    .populate('user', 'username profilePic')
    .populate('comments.user', 'username profilePic')

  if (!posts.length) return res.status(200).json({ success: true, message: 'No posts found' })

  res.status(200).json({ success: true, message: 'Posts retrieved successfully', data: { posts } })
}

export const getLikedPost = async (req, res, next) => {
  const userId = req.user._id

  const user = await User.findById(userId)

  if (!user) throw new AppError(404, 'User not found')

  const likedPost = await Post.find({ _id: { $in: user.likedPosts } })
    .populate('user', 'username profilePic')
    .populate('comments.user', 'username profilePic')

  res.status(200).json({ success: true, message: 'Posts retrieved successfully', data: { posts: likedPost } })
}

export const getFollowingPosts = async (req, res, next) => {
  const userId = req.user._id

  const user = await User.findById(userId)

  if (!user) throw new AppError(404, 'User not found')

  const following = user.following

  const feedPosts = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 })
    .populate('user', 'username profilePic')
    .populate('comments.user', 'username profilePic')

  res.status(200).json({ success: true, message: 'Posts retrieved successfully', data: { posts: feedPosts } })
}

export const getUserPosts = async (req, res, next) => {
  const { username } = req.params

  const user = await User.findOne({ username })

  if (!user) throw new AppError(404, 'User not found')

  const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate('user', 'username profilePic')
    .populate('comments.user', 'username profilePic')

  res.status(200).json({ success: true, message: 'Posts retrieved successfully', data: { posts } })
}