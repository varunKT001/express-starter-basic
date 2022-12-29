const CatchAsyncErrors = require('../middlewares/CatchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const oauth2Client = require('../oAuth/client');
const scopes = require('../oAuth/scopes');
const axios = require('axios');
const saveToJson = require('../utils/saveToJson');
const getFromJson = require('../utils/getFromJson');
const generateConfig = require('../utils/generateConfig');
const path = require('path');

/**
 * @desc    Test the API
 * @route   GET /test
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
 * @route   GET /authorize
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
 * @desc    Get authentication code of user
 * @route   GET /oauth2callback
 * @access  public
 */
exports.oauth2Callback = CatchAsyncErrors(async (req, res, next) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);

  await saveToJson(
    path.resolve(__dirname, '../', 'tokens', 'tokens.json'),
    tokens
  );

  res.json({
    success: true,
    message: 'User credentials saved',
  });
});

/**
 * @desc    Get message list of user
 * @route   GET /messages
 * @access  public
 */
exports.getMessages = CatchAsyncErrors(async (req, res, next) => {
  const { userId, maxResults, q } = req.query;

  let url = `https://gmail.googleapis.com/gmail/v1/users/${
    userId ?? 'me'
  }/messages?`;

  if (maxResults) url = url.concat(`maxResults=${maxResults}&`);
  if (q) url = url.concat(`q=${q}&`);

  const { refresh_token } = await getFromJson(
    path.resolve(__dirname, '../', 'tokens', 'tokens.json')
  );

  oauth2Client.setCredentials({ refresh_token });

  const { token } = await oauth2Client.getAccessToken();

  const config = generateConfig(url, token);
  const response = await axios(config);

  res.json(response.data);
});

/**
 * @desc    Get single message
 * @route   GET /messages/:id
 * @access  public
 */
exports.getMessage = CatchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`;

  const { refresh_token } = await getFromJson(
    path.resolve(__dirname, '../', 'tokens', 'tokens.json')
  );

  oauth2Client.setCredentials({ refresh_token });

  const { token } = await oauth2Client.getAccessToken();

  const config = generateConfig(url, token);
  const response = await axios(config);

  res.json(response.data);
});
