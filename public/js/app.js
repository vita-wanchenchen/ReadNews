$(function () {
    // declare functions
    var scrapeArticles = function scrapeArticles() {
        $.get('/scrape').then(function (data) {
            $('body').html(data);
        });
    };

    var saveArticle = function saveArticle() {
        var id = $(this).data('id');

        $.ajax({
            url: '/article/' + id,
            method: 'PUT'
        }).then(function (data) {
            location.reload();
        });
    };

    var removeArticle = function removeArticle() {
        var id = $(this).data('id');

        $.ajax({
            url: '/article/remove/' + id,
            method: 'PUT'
        }).then(function (data) {
            location.reload();
        });
    };

    var viewNotes = function viewNotes() {
        var articleId = $(this).data('id');

        // send request to get article's notes if exist
        $.ajax({
            url: '/article/' + articleId,
            method: 'GET'
        }).then(function (data) {
            // create modal with article id
            $('.modal-content').html('\n                <div class="modal-header">\n                    <h5 class="modal-title">' + data.title + '</h5>\n                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n                    <span aria-hidden="true">&times;</span>\n                    </button>\n                </div>\n                <div class="modal-body">\n                    <ul class="list-group"></ul>\n                    <textarea name="Note" class="note-content"></textarea>\n                </div>\n                <div class="modal-footer">\n                    <button type="button" data-id="' + data._id + '" class="btn btn-primary btn-save-note">Save Note</button>\n                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\n                </div>');

            var totalNotes = data.note.length;

            // if there is no note
            if (totalNotes == 0) {
                var message = '<small class="text-muted">This article doesn\'t have any note yet.</small>';
                $('.modal-body').prepend(message);
            }
            // if there is/are note(s)
            else {
                    var notes = data.note;
                    // loop through notes and append to modal
                    notes.forEach(function (note) {
                        $('.list-group').append('\n                        <li class="list-group-item justify-content-between">\n                            ' + note.body + '\n                            <span><i class="material-icons" data-id="' + note._id + '">delete_forever</i></span>\n                        </li>\n                    ');
                    });
                }

            $('.modal').modal('show');
        });
    };

    var saveNote = function saveNote() {
        var id = $(this).data('id');
        var content = $('.note-content').val().trim();

        if (content) {
            $.ajax({
                url: '/note/' + id,
                method: 'POST',
                data: { body: content }
            }).then(function (data) {
                // clear textarea
                $('.note-content').val('');
                // hide modal
                $('.modal').modal('hide');
            });
        } else {
            $('.note-content').val('');
            return;
        }
    };

    var deleteNote = function deleteNote() {
        var id = $(this).data('id');

        $.ajax({
            url: '/note/' + id,
            method: 'DELETE'
        }).then(function (data) {
            // hide modal
            $('.modal').modal('hide');
        });
    };

    // hide scrape button if on page 'saved'
    if (window.location.href.includes('saved')) {
        $('.scrape').hide();
    }

    // keep scrollbar bottom
    var contentBox = $('.note-content');
    contentBox.scrollTop = contentBox.scrollHeight;

    // click events
    $('.scrape').on('click', scrapeArticles);
    $('.btn-save').on('click', saveArticle);
    $('.btn-remove').on('click', removeArticle);
    $('.btn-view-notes').on('click', viewNotes);
    // handle click events for elements created dynamically
    $(document).on('click', '.btn-save-note', saveNote);
    $(document).on('click', '.material-icons', deleteNote);
});