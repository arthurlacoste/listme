

$(document).ready(function() {
  new Clipboard('.btn');

  $('#copybtn').popup({
    on : 'click'
  });

  $('#add_newlist').attr('action', apiurl + 'add_newlist');

  var engine = window.Liquid();

  $('.dimmable.image')
  .dimmer({
    on: 'hover'
  });

  $(document).on('DOMSubtreeModified', '#listitems', function () {
    $('.ui.checkbox').checkbox();
  });

  $('.ui.fluid.card.full')
  .dimmer({
    on: 'hover'
  });

  var hash = window.location.hash.substr(1);
  if(hash) {
    console.log(hash);
    getList(hash, 'get/' + hash);
  }

  $(this).on('click', '.vote', function () {
    var call = $(this).attr('data-call');
    console.log(call)
    getList(hash, call, true);

  });
  /**
  * Template a file and push it to #listitems
  * @param {String} view URL of the file
  * @param {Object} args Arguments to send to the template
  */

  // Template a file "view"
  function liquidRender (view, args) {
    $.ajax({
      url: 'static/views/' + view ,
      cache: false, // To force regenerate tampon in dev env
      success: function(data) {
        console.log('success')
        engine.parseAndRender(data, args).then(function(html) {
          //document.getElementById('listitems').innerHTML = html;
          //moveAnimate('#ElementToMove', '#listitems')

          $('#listitems').animate({'opacity': 0}, 400, function(){
              $(this).html(html).animate({'opacity': 1}, 400);
          });
        });
      },
      error: function (err) {
        console.log(err);
      }
    });
  }

  function existingList(id) {
    $('#listitems-section').removeClass('remove');
    $('#add_newlist').attr('action', apiurl + 'add/' + id)
    $('#newlist').removeClass('remove');
    $('#copyurl').val(window.location.origin + '#' + id);
    $('.copylink').removeClass('remove');
    $('#newitem').attr('placeholder', '');
    $('#newitem').focus()
  }
  /**
  *  Get the list of all items and push it to #listitems
  * @param {number} id Identifiant of the list wanted
  */

  function getList (id, path, alreadyExist) {
    alreadyExist = alreadyExist | false;

    $.ajax({
      url: apiurl + path,
      success: function(data) {
        // Render
        liquidRender('item.html', data);

        // Take less height
        $('.section.one').animate({
          height: 200
        }, 600);

        if (!alreadyExist) {
          existingList(id);
        }
      },
      error: function (err) {
        console.log(err);
      }
    });
  }


  (function ($) {
    var $comments = $('.js-comments');

    $('#add_newlist').submit(function () {
      //e.preventDefault();
      var form = this;
      console.log($(this).attr('id'));
      $(form).addClass('disabled');
      $('#comment-form-submit').html('<i class="fa fa-spinner fa-spin fa-fw"></i> {{ site.data.ui-text[site.locale].loading_label | default: "Loading..." }}');

      $.ajax({
        dataType: "json",
        type: $(this).attr('method'),
        url: $(this).attr('action'),
        data: $(this).serialize(),
        contentType: 'application/x-www-form-urlencoded',
        success: function (data) {

          // What i've gooooot ?
          console.log(data);

          // Everything is ok
          showAlert('Item Added :)))');


          $('#newitem').val('');

          // Render
          liquidRender('item.html', data);

          existingList(data.id)

          window.history.replaceState(null, null, '#' + data.id);

          // Take less height
          $('.section.one').animate({
            height: 200
          }, 600);

          hash = data.id;
        },
        error: function (err) {
          console.log(err);
          showAlert('{{ site.data.ui-text[site.locale].comment_error_msg | default: "Sorry, there was an error with your submission. Please make sure all required fields have been completed and try again." }}');
          $(form).removeClass('disabled');
        }
      });

      return false;
    });

    function showAlert(message) {
      console.log(message)
      $('.page__comments-form .js-notice').removeClass('hidden');
      $('.page__comments-form .js-notice-text').html(message);
    }
  })(jQuery);

});
