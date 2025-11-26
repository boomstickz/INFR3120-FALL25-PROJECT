let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let session = require('express-session'); 
let mongoose = require('mongoose');
require('dotenv').config();

let indexRouter = require('../routes/index');
let usersRouter = require('../routes/users');
let characterRouter = require('../routes/character');

let app = express();

// database connection
const mongoUri =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/forge-my-hero';

mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log(`Connected to MongoDB (${mongoUri})`))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error(
      'Ensure MongoDB is running locally or set the MONGO_URI environment variable to a reachable instance.'
    );
    process.exit(1);
  });


// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// middleware stack
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Serve static assets but defer the root path to EJS routes
app.use(express.static(path.join(__dirname, '../../public'), { index: false }));

// SESSION MIDDLEWARE (add here)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'forge-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Make user available globally in all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// ROUTES
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/characters', characterRouter);

// catch 404
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

