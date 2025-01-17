import User from '../models/user.model.js'

import { verifyToken } from '../lib/jwt.js'
import { AppError } from '../utils/errorHandler.js'

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies['session']

    if (!token) throw new AppError(401, 'Authorization token is required')

    const { userId } = await verifyToken(token)

    const user = await User.findById(userId).select('-password')

    if (!user) throw new AppError(404, 'User not found')

    req.user = user

    next()

  } catch (error) {
    console.log(`Error in middleware`)
    next(error)
  }
}