var mongoose = require('mongoose');
var roomSchema = require("./schemas/room");
var userSchema = require("./schemas/user");
var puzzleSchema = require("./schemas/puzzle");

mongoose.connection.model('Room', roomSchema);
mongoose.connection.model('User', userSchema);
mongoose.connection.model('Puzzle', puzzleSchema);
mongoose.connect('mongodb://localhost/chess');

module.exports = mongoose.connection;
