const $ = require('jquery');

$(() => {
  $(`a[href="${window.location.pathname}"]`).parents('li, ul').addClass('active');
});
