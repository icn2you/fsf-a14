// Node dependencies
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const moment = require('moment');
const router = require('express').Router();

// Local resources
const db = require('../models');
const source = 'https://www.democracynow.org/';
const defaultImg = '/assets/img/dn-default.png';

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
    result.saved = false;
    result.note = null;
    result.timestamp = Date.now();

    results.push(db.Article.findOneAndUpdate({
      title: result.title,
      date: result.date
    }, {
      title: result.title,
      link: result.link,
      date: result.date,
      image: result.image,
      saved: result.saved,
      note: result.note,
      timestamp: result.timestamp
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

    db.Article.find({ saved: { $eq: false } }, (err, docs) => {
      if (err) throw (err);

      // DEBUG:
      // console.log(docs);

      const news = docs.map((doc) =>
        Object.defineProperty(doc, 'date', {
          value: moment(doc.date).format('MM/DD/YYYY')
        }));

      res.render('index', { headlines: news });
    }).sort({ date: -1 }).limit(10);
  });

  router.get('/notes/:id/:title', (req, res) => {
    // DEBUG:
    db.Article.findById(req.params.id)
      .populate('note')
      .then((art) => {
        // console.log(`article: ${art}`);

        res.json({
          id: req.params.id,
          title: req.params.title,
          article: art
        });
      })
      .catch((err) => {
        console.err(err);
      });

    /*
    db.Article.findById(req.params.id, (err, docs) => {
      if (err) throw (err);

      // DEBUG:
      console.log(JSON.stringify(docs));

      /* - [ ] Figure out why the defineProperty method is not 
              working as defined
      const notes = docs.map((doc) =>
        Object.defineProperty(doc.note, 'date', {
          value: moment(doc.note.updatedAt).format('MM/DD/YYYY')
        }));
      */
      /*
      const notes = docs.map((doc) => {
        return {
          id: doc.note._id,
          body: doc.note.body,
          date: moment(doc.note.updatedAt).format('MM/DD/YYYY h:mm A')
        };
      });

      res.json({
        id: req.params.id,
        title: req.params.title,
        notes: notes
      });
    }).populate('note').sort({ updatedAt: -1 });
    */
  });

  router.get('/saved', (req, res) => {
    db.Article.find({ saved: { $eq: true } }, (err, docs) => {
      if (err) throw (err);

      const news = docs.map((doc) =>
        Object.defineProperty(doc, 'date', {
          value: moment(doc.date).format('MM/DD/YYYY')
        }));

      res.render('index', { 
        saved: true,
        headlines: news
      });
    }).sort({ date: -1 });
  });

  router.get('/scrape', async (req, res) => {
    try {
      const response = await axios.get(source);
      const results = await handleScrape(response);

      if (results) {
        // res.status(200);
        res.redirect('/');
      }
    } catch (err) {
      console.err(err.stack);
      res.status(500);
    }

    res.end();
  });

  router.post('/article/:id', async (req, res) => {
    try {
      // Attempt to update the selected article to saved.
      const result = await db.Article.updateOne(
        { _id: req.params.id },
        { $set: { saved: req.body.save } },
        { upsert: true }
      ).exec();

      // If the update operation was successful, notify client
      // side accordingly.
      if (result.nModified > 0 && result.ok === 1) {
        res.send({ updated: true });
      }
    } catch (err) {
      console.err(err.stack);
      res.status(500);
    }

    res.end();
  });

  router.post('/notes/:id', async (req, res) => {
    try {
      let results;
      await db.Note.create(req.body, async (err, docs) => {
        if (err) throw err;

        results = await db.Article.findOneAndUpdate(
          { _id: req.params.id },
          { note: docs._id },
          { new: true, useFindAndModify: false }
        ).exec();
      });

      res.json(results);
    } catch (err) {
      console.err(err.stack);
      res.status(500);
    }

    res.end();
  });

  router.put('/clear', async (req, res) => {
    try {
      const result = await db.Article.deleteMany(
        { saved: { $eq: false } }).exec();

      if (result.deletedCount > 0 && result.ok === 1) {
        res.send({ cleared: true });
      }
    } catch (err) {
      console.err(err.stack);
      res.status(500);
    }

    res.end();
  });

  return router;
})();
