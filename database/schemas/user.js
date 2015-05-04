var mongoose = require('mongoose');
var Schema = mongoose.Schema;
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
  sessionId: String
});

userSchema.methods.emberUser = function() {
  var token = opentok.generateToken(this.sessionId);
  var newUser = {
    id: this.id,
    username: this.username,
    sessionId: this.sessionId,
    email: this.email,
    token: token
  };

  return newUser;
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
