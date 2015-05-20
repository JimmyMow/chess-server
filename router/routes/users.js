var express = require('express');
var router = express.Router();
var logger = require('nlogger').logger(module);
var connection = require('../../database/database');
var User = connection.model('User');
var Puzzle = connection.model('Puzzle');
var apiKey = '44827272';
var secret = 'fb27ffafec7f84cfcd2da58bcf6b3565b204b6d0';
var OpenTok = require('opentok');
var opentok = new OpenTok(apiKey, secret);
var passport = require('../../middleware/authentication');
var checkForAuthentication = require('../../middleware/ensureAuth');

router.get('/:id', function(req, res) {
  User.findOne({"id": req.params.id}, function(err, user) {
    if(err) {
      logger.error('User not found. User id:', req.params.id);
      return res.sendStatus(404);
    }
    if(!user) {
      logger.error('User not found. User id:', req.params.id);
      return res.sendStatus(404);
    }
    user.emberUser(function(emberUser) {
      return res.send({ user: emberUser });
    });
  });
});

router.get('/', function(req, res) {
  switch(req.query.operation){
    case 'authenticate':
      handleCheckAuthRequest(req, res);
    break;
    default:
      res.sendStatus(400);
  }
});

router.put('/:id', checkForAuthentication, function(req, res) {
  console.log("user: ", req.body.user);
  var query = { "email": req.body.user.email };
  var update = { roomsecret: req.body.user.roomsecret };
  User.findOneAndUpdate( query, update, function(err, user) {
    if (err) {
      logger.error('Could not update user. User id:', req.body.user.id);
      return res.sendStatus(500);
    }
    if (!user) {
      logger.error('Could not find user. User id:', req.body.user.id);
      return res.sendStatus(404);
    }
    user.emberUser(function(emberUser) {
      return res.send({ user: emberUser });
    });
  });
});

router.post('/', function(req, res) {
  switch(req.body.user.meta.operation) {
    case 'login':
      handleLogin(req, res);
    break;
    default:
      handleSignup(req, res);
  }
});

module.exports = router;

function handleCheckAuthRequest(req, res){
  if( req.isAuthenticated() ) {
    req.user.emberUser(function(emberUser) {
      return res.send({ users: [emberUser] });
    });
  } else {
    return res.send({ users: [] });
  }
}

function handleLogin(req, res) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return res.sendStatus(500);
      logger.error('Could not authenticate because of error:', err);
    }
    if (!user) {
      return res.sendStatus(404);
      logger.error('Could not authenticate because there is no user');
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.sendStatus(500);
        logger.error('Could not log in session:', err);
      }
      user.emberUser(function(emberUser) {
        return res.send({ user: emberUser });
      });
    });
  })(req, res);
}

function handleSignup(req, res) {
  console.log("params: ", req.body.user.roomsecret);
  var user = new User({
    id: req.body.user.id,
    email: req.body.user.email,
    roomsecret: req.body.user.roomsecret
  });
  opentok.createSession(function(err, session) {
    if (err) {
      logger.error('Error creating opentok session. Error: ', err);
      return res.sendStatus(500);
    }
    user.sessionId = session.sessionId;
    console.log("user: ", user);
    User.createUser(user, req.body.user.password, function(err, user) {
      if(err) {
        logger.error('Could not create user:', err);
        res.status(400);
        return res.send({
          "errors": {
            "message": "Sorry, this username is already taken"
          }
        });
      }
      if(!user) {
        logger.error('Could not create user becuase no user was returned');
        res.status(400);
        return res.send({
          "errors": {
            "message": "Hmmm, looks like I messed up creating your account for some reason that I don't know of. Your best bet is to check your connection and try again."
          }
        });
      }
      req.logIn(user, function(err) {
        if (err) {
          logger.error('Could not log in session:', err);
          res.status(400);
          return res.send({
            "errors": {
              "message": "Hmmm, looks like I messed up creating your account for some reason that I don't know of. Your best bet is to check your connection and try again."
            }
          });
        }
        user.emberUser(function(emberUser) {
          return res.send({ user: emberUser });
        });
      });
    });

  });
}
