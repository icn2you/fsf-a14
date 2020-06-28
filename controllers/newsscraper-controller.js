const router = require('express').Router();
// const db = require('../models');

module.exports = (() => {
  router.get('/', (req, res) => {
    console.log(`This was your request: ${req}`);
    console.log(`And this is your response: ${res}`);

    res.render('index');
  });

  return router;
})();
