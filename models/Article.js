// Node dependencies
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = (() => {
  const ArticleSchema = new Schema({
    title: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
      // Task
      // - [ ] Implement validation with regex:
      //   @^(https?|ftp)://[^\s/$.?#].[^\s]*$@iS
      //
      // Ref: https://mathiasbynens.be/demo/url-regex
      //
      /* validate: [
        (input) => input.match()
      ] */
    },
    date: {
      type: Date,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    saved: {
      type: Boolean,
      default: false
    },
    notes: [{
      type: Schema.Types.ObjectId,
      ref: 'Note'
    }]
  }, { timestamps: true });

  return mongoose.model('Article', ArticleSchema);
})();
