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

var Engine = require('uci');
var engine = new Engine("stockfish");

engine.runProcess().then(function () {
    console.log('Started');
    return engine.uciCommand();
}).then(function (idAndOptions) {
    console.log('Engine name - ' + idAndOptions.id.name);
    return engine.isReadyCommand();
}).then(function () {
    console.log('Ready');
    return engine.uciNewGameCommand();
}).done();

io.sockets.on('connection', function (socket) {
  socket.on('join room', function(data) {
    var room = data.room;
    if (socket.room) {
      console.log("Leaving room: ", room);
      socket.leave(room);
      socket.room = undefined;
    }
    console.log("Joining room: ", room);
    socket.join(room);
    socket.room = room;
    io.sockets.emit('roomConnected', {room: room});
    engine.stopCommand();
  });

  socket.on('leave room', function(data) {
    if (socket.room) {
      var room = socket.room;
      socket.leave(room);
      console.log("Leaving room: ", room);
      socket.room = undefined;
    }
    io.sockets.emit('roomDisconnected');
    engine.stopCommand();
  });

  socket.on('turn off diagram mode', function() {
    socket.broadcast.to(socket.room).emit('turnDiagramModeOff');
  });

  socket.on('turn on diagram mode', function() {
    socket.broadcast.to(socket.room).emit('turnDiagramModeOn');
  });

  socket.on('startingGameOver', function() {
    socket.broadcast.to(socket.room).emit('startGameOver');
    console.log('Stopping analysis');
    engine.stopCommand();
  });

  socket.on('sendPosition', function(obj) {
    socket.broadcast.to(socket.room).emit('changePosition', obj);
    var fen = obj.fen;
    var move = obj.from+obj.to;
    // Stop Engine
    console.log('Stopping analysis');
    engine.stopCommand();
    engine.positionCommand(fen, move).then(function () {
      console.log('Starting position set');
      console.log('Starting analysis');
      return engine.goInfiniteCommand(function infoHandler(info) {
          var score = null;
          var depth = null;
          var nps = null;
          var variation = null;
          var bestmove = null;
          var match = info.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/);
          if (match) {
              depth = match[1];
              nps = 'Nps: ' + match[2];
          }
          if (match = info.match(/^info .*\bscore (\w+) (-?\d+)/)) {
              score = parseInt(match[2]);
              if (match[1] == 'cp') {
                  score = (score / 100.0).toFixed(2);
              } else if(match[1] == 'mate') {
                  score = '#' + score;
              }
              if(match = info.match(/\b(upper|lower)bound\b/)) {
                  // console.log("Match: ", match);
                  // console.log(((match[1] == 'upper') == (game.turn() == 'w') ? '<= ' : '>= ') + engineStatus.score);
              }
          }
          if (match = info.match(/^info .*\bpv ([a-z0-9\s]+)/)) {
              variation = match[1];
          }
          if (match = info.match(/^info .*\bcurrmove ([a-z0-9\s]+) .*\bcurrmovenumber (1$)/)) {
              bestmove = match[1];
          }
          var engineData = {score: score, depth: depth, nps: nps, bestmove: bestmove, variation: variation};
          io.sockets.in(socket.room).emit('engineData', engineData);
      });
    });
  });
});

