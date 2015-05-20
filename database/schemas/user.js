var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var puzzleSchema = require('./puzzle');
var Puzzle = mongoose.connection.model('Puzzle', puzzleSchema);
var apiKey = '44827272';
var secret = 'fb27ffafec7f84cfcd2da58bcf6b3565b204b6d0';
var OpenTok = require('opentok');
var opentok = new OpenTok(apiKey, secret);
var bcrypt = require('bcrypt');
var md5 = require('MD5');

var userSchema = new Schema({
  id: {
    type:String,
    required: true,
    unique: true
  },
  email:   {
    type:String,
    required: true,
    unique: true
  },
  password: {
    type:String,
    required: true
  },
  roomsecret: {
    type: String,
    required: true
  },
  sessionId: String
});

userSchema.methods.emberUser = function(done) {
  var token = opentok.generateToken(this.sessionId);
  var user = this;
  var newUser = {};
  newUser.id = user.id;
  newUser.sessionId = user.sessionId;
  newUser.email = user.email;
  newUser.token = token;
  newUser.roomsecret = user.roomsecret;
  this.findPuzzles(function(res) {
    newUser.puzzles = res;
    return done(newUser);
  });
};

userSchema.methods.findPuzzles = function(done) {
  Puzzle.aggregate([ { $match : { user: 'jimmymow' } }, { $group : {_id : '$_id' } },{ $limit : 5 }, { $sort : { _id : -1 } } ], function(err, res) {
    if (err) {
      return done([]);
    }
    var _ids = res.map(function(obj) {
      return obj._id;
    });
    return done(_ids);
  });
};


userSchema.methods.checkPassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, res) {
    if(err) {
      return done(err);
    }
    return done(null, res);
  });
};

userSchema.statics.hashPassword = function(password, done) {
  bcrypt.hash(password, 10, function(err, hash) {
    if(err) {
      return done(err);
    }
    return done(null, hash);
  });
}

userSchema.statics.createUser = function(user, password, done) {
  this.hashPassword(password, function(err, hash) {
    if(err) {
      return done(err, null);
    }
    if(!hash) {
      return done(true, null);
    }
    user.password = hash;
    user.save(function(err, user){
      if(err){
        return done(err, null);
      }
      return done(null, user);
    });
  });
};

module.exports = userSchema;
