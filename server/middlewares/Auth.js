const catchAsyncErrors = require('./CatchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const User = require('../models/userModel');
const oauth2Client = require('../oAuth/client');
const jwt = require('jsonwebtoken');

exports.checkUserAuthentication = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    return next(
      new ErrorHandler('Please login again to access this resource', 401)
    );
  }

  const decodedData = await jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decodedData.id);
  if (!user) {
    return next(new ErrorHandler('User not found', 401));
  }

  req.user = user;
  next();
});
