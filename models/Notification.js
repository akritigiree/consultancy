const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // reference to the user who will receive the notification
      required: true
    },
    type: {
      type: String,
      enum: ['task', 'project', 'appointment', 'general'], // notification categories
      default: 'general'
    },
    message: {
      type: String,
      required: true // notification content
    },
    read: {
      type: Boolean,
      default: false // false means unread, true means read
    }
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

module.exports = mongoose.model('Notification', notificationSchema);
