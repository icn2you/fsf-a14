// Node dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const logger = require('morgan');

// Database resources
const routes = require('./controllers/newsscraper-controller');

// HTTP port
const PORT = process.env.PORT || 3000;

// Create app and march on!
const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(routes);

// Set up handlebars.
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.listen(PORT, () => {
  console.log(
    `All the News That's Fit to Scrape app listening on port ${PORT} ...`);
});
