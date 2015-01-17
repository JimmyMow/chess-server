var express = require('express');
var app = express();
var connection = require('./database/database');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./middleware/express-config')(app);
require('./router/index')(app);

connection.once('open', function() {
  server.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
  });
});

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
  socket.on('sendPosition', function(obj) {
      socket.broadcast.emit('changePosition', obj);
  });
});

