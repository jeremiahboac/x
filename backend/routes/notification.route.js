import express from 'express'

import { protectRoute } from '../middleware/auth.middleware.js'
import { catchAsync } from '../utils/catchAsync.js'
import { deleteNotification, deleteNotifications, getNotifications } from '../controller/notification.controller.js'

const router = express.Router()

router.get('/', protectRoute, catchAsync(getNotifications))
router.delete('/', protectRoute, catchAsync(deleteNotifications))
router.delete('/:id', protectRoute, catchAsync(deleteNotification))

export default router