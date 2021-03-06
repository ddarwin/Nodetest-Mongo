var newrelic = require('newrelic');

// Start the Memory and CPU profilers
require('./profilers.js');

var config = require('config');
var express = require('express');
var morgan = require('morgan');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// New Code
var mongo = require('mongodb');
var monk = require('monk');

var dbUser = config.get('dbConfig.user');
var dbPwd = config.get('dbConfig.pwd');
var dbConn;

if (dbUser) {
	console.log("The user is "+ dbUser);
	dbconn = dbUser+":";
	dbconn += dbPwd+"@";
}

dbconn += config.get('dbConfig.host') +
  ':' + config.get('dbConfig.port') +
  '/' + config.get('dbConfig.db');

console.log("The DB Connection String is "+dbconn);

var db = monk(dbconn);

var index = require('./routes/index');
var user = require('./routes/user');
var api = require('./routes/api');

var app = express();
app.locals.newrelic = newrelic;
app.use(morgan('combined'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    req.newrelic = newrelic;
    next();
});

app.use('/', index);
app.use('/user', user);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
