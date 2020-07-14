const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = (() => {
  const NoteSchema = new Schema({
    title: String,
    body: {
      type: String,
      required: true
    }
  }, { timestamps: true });

  return mongoose.model('Note', NoteSchema);
})();
