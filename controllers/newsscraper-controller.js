const axios = require('axios');
const cheerio = require('cheerio');
const router = require('express').Router();
const db = require('../models');

module.exports = (() => {
  router.get('/', (req, res) => {
    console.log(`This was your request: ${req}`);
    console.log(`And this is your response: ${res}`);

    res.render('index');
  });

  router.get('/scrape', (req, res) => {
    axios.get('https://www.democracynow.org/').then((response) => {
      const $ = cheerio.load(response.data);
      const results = [];

      $('.news_item').each(function (i, elem) {
        // DEBUG:
        // console.log(`Article ${i} = ${$(this).contents()}`);

        const result = {};
        const link = $(this).find('h3').children('a');

        result.title = link.text();
        result.link = link.attr('href');
        result.date = $(this).find('.date').first().text();
        result.img = $(this).find('.play').attr('src');

        // DEBUG:
        // console.log(`Article ${i} = ${JSON.stringify(result)}`);

        // DEBUG:
        results.push(result);
      });

      res.json(results);
    });
  });

  return router;
})();
