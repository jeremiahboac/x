import jwt from 'jsonwebtoken'
import { AppError } from '../utils/errorHandler.js'

export const accessToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15d' })

  res.cookie('session', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development'
  })
}

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) return reject(new AppError(403, 'Unauthorized token'))

      return resolve(decoded)
    })
  })
}