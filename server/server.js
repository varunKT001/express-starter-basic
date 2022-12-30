require('dotenv').config();

const PORT = process.env.PORT || 5000;

const express = require('express');
const ErrorMiddleware = require('./middlewares/Error');
const authRouter = require('./routers/authRouter');
const gmailRouter = require('./routers/gmailRouter');
const aiRouter = require('./routers/aiRouter');
const cookieParser = require('cookie-parser');
const connectToDatabase = require('./config/db');
const path = require('path');

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

connectToDatabase();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/gmail', gmailRouter);
app.use('/api/ai', aiRouter);

if (process.env.NODE_ENV === 'production') {
  const __directory = path.resolve();
  app.use(express.static(path.join(__directory, '/client')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__directory, 'client', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API service running 🚀');
  });
}

app.use(ErrorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} 🚀`);
});
