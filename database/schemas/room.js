var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var apiKey = '44827272';
var secret = 'fb27ffafec7f84cfcd2da58bcf6b3565b204b6d0';
var OpenTok = require('opentok');
var opentok = new OpenTok(apiKey, secret);

var roomSchema = new Schema({
  sessionId:  String
});

roomSchema.methods.emberRoom = function() {
  var token = opentok.generateToken(this.sessionId);
  var emberRoom =  {
    _id: this._id,
    sessionId: this.sessionId,
    token: token,
    created_at: this.created_at,
    updated_at: this.updated_at
  };

  return emberRoom;
};

module.exports = roomSchema;
