const $ = require('jquery');

$(() => {
  $(document).on('click', '.save', function (event) {
    event.preventDefault();

    const artId = $(this).attr('data-art-id');

    $.post(`/article/${artId}`, { save: true })
      .then(async (response) => {
        if (response.updated) {
          location.reload();

          $('html, body').animate({ scrollTop: 0 }, 100);
        }
      });
  });
});
