// Node dependencies
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const moment = require('moment');
const router = require('express').Router();

// Local resources
const db = require('../models');
const source = 'https://www.democracynow.org/';
const defaultImg = '/assets/img/dn-logo.png';

// Mongo Database
mongoose.connect(
  'mongodb://localhost/newsscraperdb',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

const handleScrape = async (response) => {
  const $ = cheerio.load(response.data);
  const results = [];

  $('.news_item').each(function (i, elem) {
    const result = {};
    const link = $(this).find('h3').children('a');

    result.title = link.text();
    result.link =
      `${source.slice(0, source.length - 1)}${link.attr('href')}`;
    result.date = $(this).find('.date').first().text();
    result.image =
      ($(this).find('picture').children('img').attr('src') ||
      defaultImg);

    results.push(db.Article.findOneAndUpdate({
      title: result.title,
      date: result.date
    }, {
      title: result.title,
      link: result.link,
      date: result.date,
      image: result.image
    }, {
      new: true,
      upsert: true,
      useFindAndModify: false
    }).exec());
  });

  return Promise.all(results);
};

module.exports = (() => {
  router.get('/', (req, res) => {
    // const hbsObj = { msg: 'Hello, World!' };
    //
    // res.render('index', hbsObj);

    db.Article.find((err, docs) => {
      if (err) throw (err);

      // DEBUG:
      // console.log(docs);

      const news = docs.map((doc) =>
        Object.defineProperty(doc, 'date', {
          value: moment(doc.date).format('MM/DD/YYYY')
        }));

      res.render('index', { headlines: news });
    }).sort({ timestamp: -1 }).limit(10);
  });

  router.get('/scrape', async (req, res) => {
    try {
      const response = await axios.get(source);
      const results = await handleScrape(response);

      if (results) {
        res.json(results);
      }
    } catch (err) {
      console.err(err.stack);
    }
  });

  return router;
})();
