var passport = require('../middleware/authentication');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

module.exports = function(app) {
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(session({
    secret: 'scoop',
    resave: false,
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());
};
