require('dotenv').config();

const PORT = process.env.PORT || 5000;

const express = require('express');
const ErrorMiddleware = require('./middlewares/Error');
const mainRouter = require('./routers/mainRouter');
const app = express();

// uncaught exception
process.on('uncaughtException', (error) => {
  console.log(`Error: ${error.message}`);
  console.log(`Server shutting down due to uncaught exception`);
  process.exit(1);
});

// unhandled promise rejection
process.on('unhandledRejection', (error) => {
  console.log(`Error: ${error.message}`);
  console.log(`Server shutting down due to unhandled promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});

app.use(express.json());

app.get('/', (req, res, next) => {
  return res.status(200).send('API service running 🚀');
});

app.use('/api', mainRouter);

app.use(ErrorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} 🚀`);
});
