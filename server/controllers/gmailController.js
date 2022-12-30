const CatchAsyncErrors = require('../middlewares/CatchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const oauth2Client = require('../oAuth/client');
const scopes = require('../oAuth/scopes');
const axios = require('axios');
const generateConfig = require('../utils/generateConfig');

/**
 * @desc    Test the API
 * @route   GET /api/gmail/test
 * @access  public
 */
exports.test = CatchAsyncErrors(async (req, res, next) => {
  return res.status(200).json({
    success: true,
    message: 'Gmail route working 😀',
  });
});

/**
 * @desc    Authorize the user
 * @route   GET /api/gmail/authorize
 * @access  public
 */
exports.authorizeUser = CatchAsyncErrors(async (req, res, next) => {
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
  });

  res.redirect(authorizationUrl);
});

/**
 * @desc    Get message list of user
 * @route   GET /api/gmail/messages
 * @access  public
 */
exports.getMessages = CatchAsyncErrors(async (req, res, next) => {
  const { refresh_token } = req.user;
  const { userId, maxResults = 5, q } = req.query;

  let url = `https://gmail.googleapis.com/gmail/v1/users/${
    userId ?? 'me'
  }/messages?`;

  if (maxResults) url = url.concat(`maxResults=${maxResults}&`);
  if (q) url = url.concat(`q=${q}&`);

  oauth2Client.setCredentials({ refresh_token });

  const { token } = await oauth2Client.getAccessToken();

  const config = generateConfig(url, token);
  const response = await axios(config);

  res.json(response.data);
});

/**
 * @desc    Get single message
 * @route   GET /api/gmail/messages/:id
 * @access  public
 */
exports.getMessage = CatchAsyncErrors(async (req, res, next) => {
  const { refresh_token } = req.user;
  const id = req.params.id;

  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`;

  oauth2Client.setCredentials({ refresh_token });

  const { token } = await oauth2Client.getAccessToken();

  const config = generateConfig(url, token);
  const response = await axios(config);

  res.json(response.data);
});
