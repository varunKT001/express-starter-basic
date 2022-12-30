const CatchAsyncErrors = require('../middlewares/CatchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const openai = require('../openAI/openai');
const axios = require('axios');
const oauth2Client = require('../oAuth/client');
const generateConfig = require('../utils/generateConfig');
const getMailFromFromField = require('../utils/getMailFromFromField');
const generateIsInvestorPrompt = require('../utils/generateIsInverstorPrompt');

/**
 * @desc    Test the API
 * @route   GET /api/auth/test
 * @access  public
 */
exports.test = CatchAsyncErrors(async (req, res, next) => {
  return res.status(200).json({
    success: true,
    message: 'AI route working 😀',
  });
});

/**
 * @desc    Get analyzed messages
 * @route   GET /api/ai/analyzed-messages
 * @access  public
 */
exports.analysedMessages = CatchAsyncErrors(async (req, res, next) => {
  const { refresh_token } = req.user;
  const { userId, maxResults = 5, q, listFields, messageFields } = req.query;

  let url = `https://gmail.googleapis.com/gmail/v1/users/${
    userId ?? 'me'
  }/messages?`;

  if (maxResults) url = url.concat(`maxResults=${maxResults}&`);
  if (q) url = url.concat(`q=${q}&`);
  if (listFields) url = url.concat(`fields=${listFields}&`);

  oauth2Client.setCredentials({ refresh_token });

  const { token } = await oauth2Client.getAccessToken();

  const config = generateConfig(url, token);
  const response = await axios(config);

  let messagesPromise = [];
  response.data.messages.forEach((message) => {
    let messageUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?`;

    if (messageFields)
      messageUrl = messageUrl.concat(`fields=${messageFields}&`);

    const messageConfig = generateConfig(messageUrl, token);
    const resp = axios(messageConfig);

    messagesPromise.push(resp);
  });

  let messages = await Promise.all(messagesPromise);
  messages = messages.map((message) => message.data);

  const fromStr = messages
    .map(
      (message) => message.payload.headers.find((h) => h.name === 'From').value
    )
    .map((str) => getMailFromFromField(str))
    .join(',');

  if (fromStr.trim().length === 0) {
    return next(new ErrorHandler('No data available', 200));
  }

  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: generateIsInvestorPrompt(fromStr),
    temperature: 0,
    max_tokens: 1311,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const analyzedArray = completion.data.choices[0].text
    .split(',')
    .map((t) => t.trim())
    .map((t) => (t === 'Yes' ? true : false));

  const result = messages.map((message, index) => {
    const { id, snippet, payload } = message;
    const from = payload.headers.find((header) => header.name === 'From').value;
    const isInvestor = analyzedArray[index];
    return {
      id,
      from,
      snippet,
      isInvestor,
    };
  });

  res.json({
    success: true,
    data: result,
  });
});
