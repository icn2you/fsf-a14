const $ = require('jquery');

$(() => {
  $('#clear').on('click', (event) => {
    event.preventDefault();

    // Send the PUT request.
    $.ajax('/clear', {
      type: 'PUT',
      data: { clear: true }
    }).then(async (response) => {
      if (response.cleared) {
        location.reload();

        $('html, body').animate({ scrollTop: 0 }, 100);
      }
    });
  });
});
