import Notification from "../models/notification.model.js"
import { AppError } from "../utils/errorHandler.js"

export const getNotifications = async (req, res, next) => {
  const userId = req.user._id

  const notifications = await Notification.find({ to: userId }).populate('from', 'username profileImg')

  await Notification.updateMany({ to: userId }, { read: true })

  res.status(200).json({ success: true, message: 'Notifications retrieved successfully', data: { notifications } })
}

export const deleteNotifications = async (req, res, next) => {
  const userId = req.user._id

  await Notification.deleteMany({ to: userId })

  res.status(200).json({ success: true, message: 'Notifications deleted successfully' })
}

export const deleteNotification = async (req, res, next) => {
  const { id } = req.params
  const userId = req.user._id

  const notification = await Notification.findById(id)

  if (!notification) throw new AppError(404, 'Notification not found')

  if (notification.to.toString() !== userId.toString()) throw new AppError(403, 'You are not authorized to delete this notification')

  await Notification.findByIdAndDelete(notification._id)

  res.status(200).json({ success: true, message: 'Notification deleted successfully' })
}