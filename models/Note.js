const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = (() => {
  const NoteSchema = new Schema({
    body: {
      type: String,
      required: true
    }
  });

  return mongoose.model('Note', NoteSchema);
})();
