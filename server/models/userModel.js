const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userModel = mongoose.Schema(
  {
    sub: {
      type: String,
      require: [true, 'Please provide a user subject'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [30, 'Name cannot exceed 30 characters'],
      minLength: [4, 'Name must be atleast 4 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
    },
    picture: {
      type: String,
    },
    refresh_token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userModel.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model('User', userModel);
