var express = require('express');
var router = express.Router();
var logger = require('nlogger').logger(module);
var connection = require('../../database/database');
var Game = connection.model('Game');
var checkForAuthentication = require('../../middleware/ensureAuth');

router.get('/', function(req, res) {
  var query = req.query;
  var fields = {};
  Game.find({ $query: { user: query.user }, $orderby: { _id : -1 } }, fields, { skip: query.skip, limit: 5 }, function(err, games) {
    if(err) {
      return res.sendStatus(500);
      logger.error('Could not find puzzle:', err);
    }
    return res.send( { games: games } );
  });
});

router.get('/:id', function(req, res) {
  var id = req.params.id;
  console.log("here getting a game: ", id);
  Game.findOne( { _id : id }, function(err, game) {
    if(err) {
      return res.sendStatus(500);
      logger.error('Could not find puzzle:', err);
    }

    return res.send( {game: game} );
  });
});

router.post('/', checkForAuthentication, function(req, res) {
  Game.create(req.body.game, function(err, game) {
    if (err) {
      logger.error('Error creating puzzle. Error: ', err);
      return res.sendStatus(500);
    };
    return res.send({ game: game.emberGame() });
  });
});

router.delete('/:id', function(req, res) {
  var gameId = req.params.id;
  Game.findByIdAndRemove(gameId, function(err, result) {
    if(err) {
      return res.sendStatus(500);
      logger.error('Could not find or remove puzzle. Puzzle id:', puzzleId);
    }
    return res.send({});
  });
});

module.exports = router;
