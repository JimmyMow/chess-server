var mongoose = require('mongoose');
var roomSchema = require("./schemas/room");

mongoose.connection.model('Room', roomSchema);
mongoose.connect('mongodb://localhost/chess');

module.exports = mongoose.connection;
