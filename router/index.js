module.exports = function (app) {
  app.use('/api/rooms', require('./routes/rooms'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/logout', require('./routes/auth'));
};
