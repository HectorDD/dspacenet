var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var hbs = require('hbs');

var index = require('./routes/index');
var users = require('./routes/users');
var new1 = require('./routes/new');
var wall = require('./routes/wall');
var friend = require('./routes/friend');
var send = require('./routes/send');
var global = require('./routes/global');
var api = require('./v2/routes/api');
var wallV2 = require('./v2/routes/wall');
var wallV3 = require('./v3/routes/wall');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

hbs.registerPartials(path.join(__dirname, 'v3/templates/views/partials'));
require('./v3/templates/views/helpers');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret:"este es mi secreto"}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/v3/', express.static(path.join(__dirname, 'v3/public')));

app.use(express.static('public'));

app.use('/new', new1);
app.use(function (req, res, next) {
  if (req.session.user === undefined) {
    res.redirect('/new');
  } else next();
});
app.use('/', index);
app.use('/users', users);
app.use('/prev', index);
app.use('/logout', index);
app.use('/friend', friend);
app.use('/send', send);
app.use('/global', global);
app.use('/api', api);

app.use('/oldwall', wall);
app.use('/wall/', wallV2);
app.use('/v3/wall/', wallV3);

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
