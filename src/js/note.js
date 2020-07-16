// Module required for modal component to work properly.
require('bootstrap/js/dist/modal');

const $ = require('jquery');

$(() => {
  $(document).on('click', '.notes', function (event) {
    event.preventDefault();

    const artId = $(this).attr('data-art-id');
    const artTitle = $(this).attr('data-art-title');

    $.get(`/notes/${artId}/${artTitle}`)
      .then(async (response) => {
        if (response) {
          const notes = response.notes;
          let artNotes;

          if (notes.length > 0) {
            artNotes = notes.map((note) => {
              const formattedNote =
                `<div id="${note.id}" class="art-note row">` +
                  '<div class="col-10">' +
                    '<p>' +
                      '<small class="timestamp">' +
                        `[<span class="text-muted">${note.date}</span>]:` +
                      `</small>&nbsp;&nbsp;${note.body}</p>` +
                  '</div>' +
                  '<div class="col-2">' +
                    `<button type="button" class="trash" data-note-id="${note.id}" aria-label="Delete">` +
                      '<i class="far fa-trash-alt"></i>' +
                    '</button>' +
                  '</div>' +
                '</div>';

              return formattedNote;
            });
          } else {
            artNotes =
              '<div class="art-note">' +
                '<p>You have not saved any notes for this article.</p>' +
              '</div>';
          }

          // Load notes
          $('#notes-title').text(`Notes for “${response.title}”`);
          $('#art-notes')
            .attr('data-art-id', response.id)
            .html(artNotes);
        }

        // Display notes modal
        $('#notes-modal').modal('toggle');
      });
  });

  $(document).on('click', '#save-note', function (event) {
    event.preventDefault();

    const artId = $('#art-notes').attr('data-art-id');
    const note = $('#new-art-note').val().trim();

    $('#new-art-note').val('');

    $.post(`/notes/${artId}`, { body: note })
      .then(async (response) => {
        if (response.updated) {
          $('#alert-msg').html('<p>SUCCESS!<br>Your note was added to the article.</p>');
        } else {
          $('#alert-msg').text('<p>FAILURE!<br>Your note was NOT added to the article.</p>');
        }

        $('#alert-modal').modal('toggle');
      });
  });

  $(document).on('click', '.trash', function (event) {
    event.preventDefault();

    const noteId = $(this).attr('data-note-id');

    $.ajax(`/note/${noteId}`, {
      type: 'PUT',
      data: { delete: true }
    })
      .then(async (response) => {
        if (response.deleted) {
          $(`#${noteId}`).remove();
        }
      });
  });
});
