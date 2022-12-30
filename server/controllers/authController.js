const CatchAsyncErrors = require('../middlewares/CatchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const User = require('../models/userModel');
const oauth2Client = require('../oAuth/client');
const google = require('googleapis').google;
const scopes = require('../oAuth/scopes');
const cookieOptions = require('../utils/cookieOptions');

/**
 * @desc    Test the API
 * @route   GET /api/auth/test
 * @access  public
 */
exports.test = CatchAsyncErrors(async (req, res, next) => {
  return res.status(200).json({
    success: true,
    message: 'Auth route working 😀',
  });
});

/**
 * @desc    Login the user
 * @route   GET /api/auth/login
 * @access  public
 */
exports.login = CatchAsyncErrors(async (req, res, next) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  const { access_token, refresh_token } = tokens;

  oauth2Client.setCredentials({
    refresh_token,
    access_token,
  });

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2',
  });

  const { data } = await oauth2.userinfo.get();

  const { id: sub, email, name, picture } = data;

  let newUser = null;
  const existingUser = await User.findOne({ sub });
  if (existingUser) {
    newUser = await User.findOneAndUpdate(
      { sub },
      { sub, name, email, picture, refresh_token },
      { new: true }
    );
  } else {
    newUser = await User.create({ sub, name, email, picture, refresh_token });
  }

  const authToken = newUser.getJwtToken();

  const cookieOpts = cookieOptions();
  return res
    .status(200)
    .cookie('authToken', authToken, cookieOpts)
    .redirect('/dashboard');
});

/**
 * @desc    Get user's profile
 * @route   GET /api/auth/profile
 * @access  public
 */
exports.getUserProfile = CatchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  return res.status(200).json({
    success: true,
    data: user,
    message: 'User profile fetched',
  });
});

/**
 * @desc    Logout user
 * @route   GET /api/auth/logout
 * @access  public
 */
exports.logout = CatchAsyncErrors(async (req, res, next) => {
  return res
    .status(200)
    .cookie('authToken', null, {
      expires: new Date(Date.now()),
    })
    .redirect('/login');
});
