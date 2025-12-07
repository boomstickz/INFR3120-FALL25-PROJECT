let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let session = require('express-session'); 
let mongoose = require('mongoose');
require('dotenv').config();
// for accesing mongodb
let DB = require('./db');

let indexRouter = require('../routes/index');
let usersRouter = require('../routes/users');
let characterRouter = require('../routes/character');

let app = express();


// connection to mongodb
mongoose.connect(DB.URI);
let mongoDB = mongoose.connection;
mongoDB.on('error', console.error.bind(console, 'Connection Error'));
mongoDB.once('open', () => {
  console.log('Connected to the MongoDB');
});


// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// middleware stack
app.use(logger('dev'));
// Increase body parser limits to handle larger base64 payloads from character portraits
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
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

