import validator from 'validator'
import bcrypt from 'bcrypt'

import { AppError } from '../utils/errorHandler.js'
import { accessToken } from '../lib/jwt.js'
import User from '../models/user.model.js'

export const signup = async (req, res, next) => {
  const { username, fullName, password, email } = req.body

  if (!validator.isEmail(email)) throw new AppError(400, 'Invalid email')

  const existingUser = await User.findOne({ username })

  if (existingUser) throw new AppError(400, 'Username already taken')

  const existingEmail = await User.findOne({ email })

  if (existingEmail) throw new AppError(400, 'Email already taken')

  if (!validator.isStrongPassword(password)) throw new AppError(400, 'Please enter a strong password')

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = await User.create({ username, fullName, password: hashedPassword, email })

  if (newUser) {
    accessToken(newUser._id, res)

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg
      }
    })
  } else {
    throw new AppError(400, 'Invalid user data')
  }
}

export const login = async (req, res, next) => {
  const { username, password } = req.body

  if (!username || !password) throw new AppError(400, 'Please enter username and password')

  const user = await User.findOne({
    $or: [
      { username },
      { email: username }
    ]
  })

  if (!user || !(await bcrypt.compare(password, user.password))) throw new AppError(400, 'Username or password is incorrect')

  accessToken(user._id, res)

  res.status(200).json({
    success: true,
    message: 'User logged in successfully',
    data: {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg
    }
  })
}

export const logout = (req, res, next) => {
  res.clearCookie('session').status(200).json({ success: true, message: 'User logged out successfully' })
}

export const getMe = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: {
      user: req.user
    }
  })
}