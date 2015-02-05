var express = require('express');
var router = express.Router();
var logger = require('nlogger').logger(module);
var connection = require('../../database/database');
var Room = connection.model('Room');
var apiKey = '44827272';
var secret = 'fb27ffafec7f84cfcd2da58bcf6b3565b204b6d0';
var OpenTok = require('opentok');
var opentok = new OpenTok(apiKey, secret);

router.get('/:id', function(req, res) {
  Room.findOne({_id: req.params.id}, function(err, room) {
    if(err) {
      return res.sendStatus(500);
    }
    res.send({ room: room.emberRoom() });
  });
});

router.post('/', function(req, res) {
  opentok.createSession(function(err, session) {
    if (err) {
      logger.error('Error creating opentok session. Error: ', err);
      return res.sendStatus(500);
    };
    Room.create({sessionId: session.sessionId}, function(err, room) {
      if(err) {
        logger.error('Problem creating room. Error: ', err);
        return res.sendStatus(500);
      }
      return res.send({ room: room.emberRoom() });
    });
  });
});

module.exports = router;
