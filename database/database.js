var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var roomSchema = require("./schemas/room");
var userSchema = require("./schemas/user");
var puzzleSchema = require("./schemas/puzzle");
var gameSchema = require("./schemas/game");

mongoose.plugin(timestamps,  {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

userSchema.plugin(timestamps);
puzzleSchema.plugin(timestamps);
roomSchema.plugin(timestamps);
gameSchema.plugin(timestamps);

mongoose.connection.model('Room', roomSchema);
mongoose.connection.model('User', userSchema);
mongoose.connection.model('Puzzle', puzzleSchema);
mongoose.connection.model('Game', gameSchema);
mongoose.connect('mongodb://localhost/chess');

module.exports = mongoose.connection;
