// Node dependencies
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
// const time = require('moment');
const router = require('express').Router();

// Local resources
const source = 'https://www.democracynow.org/';
const db = require('../models');

// Mongo Database
mongoose.connect(
  'mongodb://localhost/newsscraperdb',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

module.exports = (() => {
  router.get('/', (req, res) => {
    // const hbsObj = { msg: 'Hello, World!' };
    //
    // res.render('index', hbsObj);

    db.Article.find((err, docs) => {
      if (err) throw (err);

      // DEBUG:
      console.log(docs);

      res.render('index', { headlines: docs });
    }).sort({ timestamp: -1 }).limit(10);
  });

  router.get('/scrape', (req, res) => {
    axios.get(source).then((response) => {
      const $ = cheerio.load(response.data);
      const results = [];

      $('.news_item').each(function (i, elem) {
        // DEBUG:
        // console.log(`Article ${i} = ${$(this).contents()}`);

        const result = {};
        const link = $(this).find('h3').children('a');

        result.title = link.text();
        result.link =
          `${source.slice(0, source.length - 1)}${link.attr('href')}`;
        result.date = $(this).find('.date').first().text();
        result.image =
          $(this).find('picture').children('img').attr('src');

        // DEBUG:
        console.log(`Article ${i} = ${JSON.stringify(result)}`);

        if (!db.Article.find({ title: result.title }).count()) {
          db.Article.create(result)
            .then((dbArticle) => {
              console.log(dbArticle);
            })
            .catch(console.err);

          // DEBUG:
          results.push(result);
        }
      });

      /*
        Test Code

        Query is returning Object, rather than number. Why?
      */
      const test = db.Article.find().count();

      console.log('count: ' + JSON.stringify(test));

      // <-- End Test Code -->

      res.json(results);
    });
  });

  return router;
})();
