import { Schema, model } from "mongoose";

const notificationSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'follow'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Notification = model('Notification', notificationSchema)

export default Notification