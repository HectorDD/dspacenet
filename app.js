var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var hbs = require('hbs');
var hbsutils = require('hbs-utils')(hbs);

var api = require('./routes/api');
var space = require('./routes/space');
var login = require('./routes/login');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'templates/views'));
app.set('view engine', 'hbs');

hbsutils.registerWatchedPartials(path.join(__dirname, 'templates/views/partials'));
require('./templates/views/helpers');
hbs.localsAsTemplateData(app);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret:"este es mi secreto"}));
app.use(express.static(path.join(__dirname, 'public')));

//app.use(express.static('public'));
app.use('/login',login);
app.use(function (req, res, next) {
  if (req.session.user === undefined) {
    res.redirect('/login');
  } else {
    res.locals.userId = req.session.userId;
    res.locals.user = req.session.user;
    next();
  }
});
app.use('/api', api);
app.use('/space/', space);
app.get('/', function (req, res) {
  res.redirect('/space/global');
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
