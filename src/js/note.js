// Module required for modal component to work properly.
require('bootstrap/js/dist/modal');

const $ = require('jquery');

$(() => {
  $(document).on('click', '.notes', function (event) {
    event.preventDefault();

    console.log(event.target);

    const artId = $(this).attr('data-art-id');
    const artTitle = $(this).attr('data-art-title');

    $.get(`/notes/${artId}/${artTitle}`)
      .then(async (response) => {
        console.log(JSON.stringify(response));

        if (response) {
          // Display notes
          $('#art-notes').attr('data-art-id', response.id);
          $('#notes-title').text(`Notes for “${response.title}”`);
/*           <div class="art-note">
            <p>{{ body }}</p>
            <button type="button" class="trash" data-note-id="{{ _id }}" aria-label="Delete">
              <i class="far fa-trash-alt"></i>
            </button>
          </div>
 */
        }

        $('#notes-modal').modal('toggle');
      });
  });

  $(document).on('click', '#save-note', function (event) {
    event.preventDefault();

    const artId = $('#art-notes').attr('data-art-id');
    const note = $('#new-art-note').val().trim();

    console.log(`ID: ${artId}`);
    console.log(`Note: ${note}`);

    $.post(`/notes/${artId}`, { body: note })
      .then(async (response) => {
        if (response) {
          console.log(response);

          // location.reload();
        }
      });
  });
});
