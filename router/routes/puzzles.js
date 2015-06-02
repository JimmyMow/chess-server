var express = require('express');
var router = express.Router();
var logger = require('nlogger').logger(module);
var connection = require('../../database/database');
var Puzzle = connection.model('Puzzle');

router.get('/', function(req, res) {
  var query = req.query;
  console.log("query: ", query);
  var fields = {};
  Puzzle.find({ $query: { user: query.user }, $orderby: { _id : -1 } }, fields, { skip: query.skip, limit: 5 }, function(err, puzzles) {
    if(err) {
      return res.sendStatus(500);
      logger.error('Could not find puzzle:', err);
    }
    console.log("puzzles: ", puzzles);
    return res.send( { puzzles: puzzles } );
  });
});

router.get('/:id', function(req, res) {
  var id = req.params.id;
  Puzzle.findOne( { _id : id }, function(err, puzzle) {
    if(err) {
      return res.sendStatus(500);
      logger.error('Could not find puzzle:', err);
    }

    return res.send( {puzzle: puzzle} );
  });
});

router.put('/:id', function(req, res) {
  var query = { "_id": req.params.id };
  var puzzleParams = req.body.puzzle;

  Puzzle.findOneAndUpdate( query, puzzleParams, function(err, puzzle) {
    if (err) {
      logger.error('Could not update puzzle. Puzzle id:', req.params.id);
      return res.sendStatus(500);
    }
    if (!puzzle) {
      logger.error('Could not find puzzle. Puzzle id:', req.params.id);
      return res.sendStatus(404);
    }

    return res.send({ puzzle: puzzle.emberPuzzle() });
  });
});

router.post('/', function(req, res) {
  Puzzle.create(req.body.puzzle, function(err, puzzle) {
    if (err) {
      logger.error('Error creating puzzle. Error: ', err);
      return res.sendStatus(500);
    };
    return res.send({ puzzle: puzzle.emberPuzzle() });
  });
});

module.exports = router;
