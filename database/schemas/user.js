var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var apiKey = '44827272';
var secret = 'fb27ffafec7f84cfcd2da58bcf6b3565b204b6d0';
var OpenTok = require('opentok');
var opentok = new OpenTok(apiKey, secret);

var userSchema = new Schema({

});

// userSchema.methods.emberUser = function() {
//   var token = opentok.generateToken(this.sessionId);
//   var emberRoom =  {
//     _id: this._id,
//     sessionId: this.sessionId,
//     token: token
//   };

//   return emberRoom;
// };

module.exports = roomSchema;
