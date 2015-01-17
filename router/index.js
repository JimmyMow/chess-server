module.exports = function (app) {
  app.use('/api/rooms', require('./routes/rooms'));
};
