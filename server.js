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
    var clients = findClientsSocket(room);
    if (clients.length > 0) {
      var socketId = clients[0].id;
      var mySocketId = socket.id;
      io.sockets.connected[socketId].emit('canIhaveYourGameData', { socketId: mySocketId });
    }
    engine.stopCommand();
  });

  socket.on('leave room', function(data) {
    if (socket.room) {
      var room = socket.room;
      socket.leave(room);
      console.log("Leaving room: ", room);
      socket.room = undefined;
    }
    io.sockets.emit('roomDisconnected', { room: "hi" });
    engine.stopCommand();
  });

  socket.on('update client', function(data) {
    var socketId = data.socketId;
    io.sockets.connected[socketId].emit('getUpdated', data);
  });

  socket.on('turn off diagram mode', function() {
    socket.broadcast.to(socket.room).emit('turnDiagramModeOff');
  });

  socket.on('turn on diagram mode', function() {
    socket.broadcast.to(socket.room).emit('turnDiagramModeOn');
  });

  socket.on('send diagram', function(data) {
    socket.broadcast.to(socket.room).emit('drawForOthers', data);
  });

  socket.on('clear diagram', function() {
    socket.broadcast.to(socket.room).emit('clearDiagram');
  });

  socket.on('startingGameOver', function() {
    socket.broadcast.to(socket.room).emit('startGameOver');
    console.log('Stopping analysis');
    engine.stopCommand();
  });

  socket.on('startPos', function() {
    socket.broadcast.to(socket.room).emit('startPos');
    console.log('Stopping analysis');
    engine.stopCommand();
  });

  socket.on('start analyzing', function(data) {
    var fen = data.fen;
    io.sockets.in(socket.room).emit('stockfishOn');
    stockfishAnalysis(fen, socket);
  });

  socket.on('stop analyzing', function() {
    console.log('Stopping analysis. Turning Stockfish off.');
    engine.stopCommand();
    io.sockets.in(socket.room).emit('stockfishOff');
  });

  socket.on('sendPosition', function(data) {
    socket.broadcast.to(socket.room).emit('changePosition', data);
    var fen = data.gameFen;
    if (data.stockfish) {
      stockfishAnalysis(fen, socket);
    }
  });

  socket.on('undo move', function() {
    socket.broadcast.to(socket.room).emit('undoMove');
  });

  socket.on('upload pgn', function(data) {
    socket.broadcast.to(socket.room).emit('uploadTheirPgn', data);
  });
});

// Find clients connected to a room
function findClientsSocket(roomId, namespace) {
    var res = []
    , ns = io.of(namespace ||"/");    // the default namespace is "/"

    if (ns) {
        for (var id in ns.connected) {
            if(roomId) {
                var index = ns.connected[id].rooms.indexOf(roomId) ;
                if(index !== -1) {
                    res.push(ns.connected[id]);
                }
            } else {
                res.push(ns.connected[id]);
            }
        }
    }
    return res;
}

// Perform Stockfish analysis

function stockfishAnalysis(fen, socket) {
  console.log('Stopping analysis');
  engine.stopCommand();
  engine.positionCommand(fen).then(function () {
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
}
