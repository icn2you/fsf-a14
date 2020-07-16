// Node dependencies
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const moment = require('moment');
const router = require('express').Router();

// Local resources
const db = require('../models');
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost/newsscraperdb';
const defaultImg = '/assets/img/dn-default.png';
const source = 'https://www.democracynow.org/';

// Mongo Database
mongoose.connect(
  MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

mongoose.connection
  .on('error', console.error.bind(console, 'Error!'))
  .once('connected', () => {
    console.log('Connected!');
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
    db.Article.find({ saved: false }, (err, arts) => {
      if (err) throw (err);

      const news = arts.map((art) =>
        Object.defineProperty(art, 'date', {
          value: moment(art.date).format('MM/DD/YYYY')
        }));

      res.render('index', { headlines: news });
    }).sort({ date: -1 }).limit(10);
  });

  router.get('/notes/:id/:title', (req, res) => {
    db.Article.findById(req.params.id, (err, art) => {
      if (err) throw (err);

      /* - [ ] Figure out why the defineProperty method is not
              working as defined here.
      const notes = art.notes.map((note) =>
        Object.defineProperty(note, 'date', {
          value: moment(note.updatedAt).format('MM/DD/YYYY h:mm A')
        }));
      */

      const notes = art.notes.map((note) => {
        return {
          id: note._id,
          body: note.body,
          date: moment(note.updatedAt).format('MM/DD/YYYY h:mm A')
        };
      });

      res.json({
        id: req.params.id,
        title: req.params.title,
        notes: notes
      });
    }).populate('notes').sort({ updatedAt: -1 });
  });

  router.get('/saved', (req, res) => {
    db.Article.find({ saved: true }, (err, arts) => {
      if (err) throw (err);

      const news = arts.map((art) =>
        Object.defineProperty(art, 'date', {
          value: moment(art.date).format('MM/DD/YYYY')
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
      const note = await db.Note.create(req.body);
      const article = await db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { notes: note._id } },
        { new: true, useFindAndModify: false }
      ).exec();

      if (article) {
        res.send({ updated: true });
      }
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

  router.put('/note/:id', async (req, res) => {
    try {
      const result = await db.Note.deleteOne(
        { _id: req.params.id }).exec();

      if (result.deletedCount > 0 && result.ok === 1) {
        res.send({ deleted: true });
      }
    } catch (err) {
      console.err(err.stack);
      res.status(500);
    }

    res.end();
  });

  return router;
})();
