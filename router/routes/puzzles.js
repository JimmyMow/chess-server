var express = require('express');
var router = express.Router();
var logger = require('nlogger').logger(module);
var connection = require('../../database/database');
var Puzzle = connection.model('Puzzle');
var checkForAuthentication = require('../../middleware/ensureAuth');

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
  console.log("here getting a puzzle");
  var id = req.params.id;
  Puzzle.findOne( { _id : id }, function(err, puzzle) {
    if(err) {
      return res.sendStatus(500);
      logger.error('Could not find puzzle:', err);
    }

    return res.send( {puzzle: puzzle} );
  });
});

router.put('/:id', checkForAuthentication, function(req, res) {
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

router.post('/', checkForAuthentication, function(req, res) {
  Puzzle.create(req.body.puzzle, function(err, puzzle) {
    if (err) {
      logger.error('Error creating puzzle. Error: ', err);
      return res.sendStatus(500);
    };
    return res.send({ puzzle: puzzle.emberPuzzle() });
  });
});

router.delete('/:id', function(req, res) {
  var puzzleId = req.params.id;
  console.log("here with: ", puzzleId);
  Puzzle.findByIdAndRemove(puzzleId, function(err, result) {
    if(err) {
      console.log("error!: ", err);
      return res.sendStatus(500);
      logger.error('Could not find or remove puzzle. Puzzle id:', puzzleId);
    }
    console.log("shouldve deleted");
    return res.send({});
  });
});

module.exports = router;
