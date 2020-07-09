const $ = require('jquery');

$(document).on('click', '.delete', function (event) {
  event.preventDefault();

  const artId = $(this).attr('data-art-id');

  $.post(`/article/${artId}`, { save: false })
    .then(async (response) => {
      if (response.updated) {
        location.reload();

        $('html, body').animate({ scrollTop: 0 }, 100);
      }
    });
});
