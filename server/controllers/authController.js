const CatchAsyncErrors = require('../middlewares/CatchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const User = require('../models/userModel');
const oauth2Client = require('../oAuth/client');
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
  const token = req.body.credential;
  if (!token) {
    return next(new ErrorHandler('No credential token in post body', 400));
  }

  const csrfTokenCookie = req.cookies['g_csrf_token'];
  if (!csrfTokenCookie) {
    return next(new ErrorHandler('No CSRF token in Cookie', 400));
  }

  const csrfToken = req.body['g_csrf_token'];
  if (!csrfToken) {
    return next(new ErrorHandler('No CSRF token in post body', 400));
  }

  if (csrfToken !== csrfTokenCookie) {
    return next(new ErrorHandler('Failed to verify double submit cookie', 400));
  }

  const ticket = await oauth2Client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  });

  const { sub, name, email, picture } = ticket.getPayload();

  let newUser = null;
  const existingUser = await User.findOne({ sub });
  if (existingUser) newUser = existingUser;
  else newUser = await User.create({ sub, name, email, picture });

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
