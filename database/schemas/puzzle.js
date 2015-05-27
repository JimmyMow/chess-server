var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var puzzleSchema = new Schema({
  position: {
    type: String,
    required: true
  },
  gameFen: {
    type: String,
    required:true
  },
  user: {
    type: String,
    required: true
  },
  name: {
    type: String
  }
});

puzzleSchema.methods.emberPuzzle = function() {
  var newPuzzle = {
    _id: this._id,
    name: this.name,
    position: this.position,
    user: this.user,
    gameFen: this.gameFen,
    created_at: this.created_at,
    updated_at: this.updated_at
  };

  return newPuzzle;
};

module.exports = puzzleSchema;
