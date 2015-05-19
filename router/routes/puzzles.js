var express = require('express');
var router = express.Router();
var logger = require('nlogger').logger(module);
var connection = require('../../database/database');
var Puzzle = connection.model('Puzzle');

router.get('/', function(req, res) {
  var query = req.query;
  var fields = {};
  Puzzle.find({ $query: { user: query.user }, $orderby: { _id : -1 } }, fields, { skip: query.skip, limit: 5 }, function(err, puzzles) {
    if(err) {
      return res.sendStatus(500);
      logger.error('Could not find puzzle:', err);
    }
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

router.post('/', function(req, res) {
  console.log(req.body.puzzle);
  Puzzle.create(req.body.puzzle, function(err, puzzle) {
    if (err) {
      logger.error('Error creating puzzle. Error: ', err);
      return res.sendStatus(500);
    };
    return res.send({ puzzle: puzzle.emberPuzzle() });
  });
});

module.exports = router;
