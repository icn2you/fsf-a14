const $ = require('jquery');

$(() => {
  $(document).on('click', '.save', function (event) {
    event.preventDefault();

    const artId = $(this).attr('data-artId');

    // DEBUG:
    console.log(`artId: ${artId}`);
  });
});
