// models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  addresses: [
    {
      name: String,
      mobileNo: String,
      houseNo: String,
      street: String,
      landmark: String,
      city: String,
      country: String,
      postalCode: String,
    },
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  // THÊM TRƯỜNG ROLE MỚI
  role: {
    type: String,
    enum: ['user', 'admin'], // Chỉ chấp nhận 'user' hoặc 'admin'
    default: 'user', // Mặc định là 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const User = mongoose.model("User", userSchema);

module.exports = User;