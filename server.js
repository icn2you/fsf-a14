// Node dependencies
const express = require('express');
const handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } =
  require('@handlebars/allow-prototype-access');
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
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  handlebars: allowInsecurePrototypeAccess(handlebars)
}));
app.set('view engine', 'handlebars');

app.listen(PORT, () => {
  console.log(
    `All the News That's Fit to Scrape app listening on port ${PORT} ...`);
});
