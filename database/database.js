var mongoose = require('mongoose');
var roomSchema = require("./schemas/room");
var userSchema = require("./schemas/user");

mongoose.connection.model('Room', roomSchema);
mongoose.connection.model('User', userSchema);
mongoose.connect('mongodb://localhost/chess');

module.exports = mongoose.connection;
