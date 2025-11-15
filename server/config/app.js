var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// added mongoose for mongodb collection
let mongoose = require('mongoose');
let DB = require('./db');

var indexRouter = require('../routes/index');
var usersRouter = require('../routes/users');
let characterRouter = require('../routes/character');
var app = express();

// Test DB Connection
mongoose.connect(DB.URI);
let mongoDB = mongoose.connection;
mongoDB.on('error', console.error.bind(console,'Connection error'));
mongoDB.once('open',()=>{
  console.log('Connected to the MongoDB');
})

// view engine setup (point to ../views from /config)
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// middleware stack
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// static folders (back out of /server to project root)
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../node_modules')));

// route mapping
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/characters', characterRouter);                // ⬅ IMPORTANT

// catch 404 and forward to error handler
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
