var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gameSchema = new Schema({
  pgn: {
    type: String,
    required: true
  },
  fen: {
    type: String
  },
  white: {
    type: String
  },
  black: {
    type: String
  },
  white_elo: {
    type: String
  },
  black_elo: {
    type: String
  },
  result: {
    type: String
  },
  user: {
    type: String,
    required: true
  }
});

gameSchema.methods.emberGame = function() {
  var newGame = {
    _id: this._id,
    pgn: this.pgn,
    fen: this.fen,
    white: this.white,
    black: this.black,
    white_elo: this.white_elo,
    black_elo: this.black_elo,
    result: this.result,
    user: this.user,
    created_at: this.created_at,
    updated_at: this.updated_at
  };

  return newGame;
};

module.exports = gameSchema;
