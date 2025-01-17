import bcrypt from 'bcrypt'
import validator from 'validator'
import { v2 as cloudinary } from 'cloudinary'

import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"

import { AppError } from "../utils/errorHandler.js"

export const getUserProfile = async (req, res, next) => {
  const { username } = req.params

  const user = await User.findOne({ username }).select('-password')

  if (!user) throw new AppError(404, 'User not found')

  res.status(200).json({ success: true, message: 'User retrieved successfully', data: { user } })
}

export const followUnfollowUser = async (req, res, next) => {
  const { id } = req.params

  const [userToModify, currentUser] = await Promise.all([User.findById(id), User.findById(req.user._id)])

  if (id === req.user._id.toString()) throw new AppError(400, 'You cannot follow or unfollow yourself')

  if (!userToModify || !currentUser) throw new AppError(404, 'User not found')

  const isFollowing = currentUser.following.includes(id)

  if (isFollowing) {
    await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }, { new: true })
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }, { new: true })

    return res.status(200).json({ success: true, message: 'User unfollowed successfully' })
  } else {
    await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } }, { new: true })
    await User.findByIdAndUpdate(req.user._id, { $push: { following: id } }, { new: true })

    await Notification.create({
      type: 'follow',
      from: req.user._id,
      to: userToModify._id
    })

    return res.status(200).json({ success: true, message: 'User followed successfully' })
  }
}

export const getSuggestedUsers = async (req, res, next) => {
  const userId = req.user._id

  const usersFollowedByMe = await User.findById(userId).select('following')

  const users = await User.aggregate([
    {
      $match: {
        _id: { $ne: userId },
      }
    },
    {
      $sample: {
        size: 10
      }
    }
  ])

  const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id))

  const suggestedUsers = filteredUsers.slice(0, 4)

  suggestedUsers.forEach(user => delete user.password)

  res.status(200).json({ success: true, message: 'Suggested users retrieved successfully', data: { suggestedUsers } })
}

export const updateUser = async (req, res, next) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body
  let { profileImg, coverImg } = req.body

  const userId = req.user._id

  let user = await User.findById(userId)

  if (!user) throw new AppError(404, 'User not found')

  if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) throw new AppError(400, 'Please enter both current and new password')

  if (currentPassword && newPassword) {
    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) throw new AppError(400, 'Password is incorrect')

    if (!validator.isStrongPassword(newPassword)) throw new AppError(400, 'Please enter a strong password')

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashedPassword
  }

  if (profileImg) {
    if (user.profileImg) {
      await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0])
    }

    const uploadedImg = await cloudinary.uploader.upload(profileImg, { folder: 'x_profileImg' })

    profileImg = uploadedImg.secure_url
  }

  if (coverImg) {
    if (user.coverImg) {
      await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0])
    }

    const uploadedImg = await cloudinary.uploader.upload(profileImg, { folder: 'x_coverImg' })

    coverImg = uploadedImg.secure_url
  }

  user.fullName = fullName || user.fullName
  user.email = email || user.email
  user.username = username || user.username
  user.profileImg = profileImg || user.profileImg
  user.coverImg = coverImg || user.coverImg
  user.bio = bio || user.bio
  user.link = link || user.link

  user = await user.save()

  delete user.password

  res.status(200).json({ success: true, message: 'User updated successfully', data: { user } })
}