// For dev or prod env
var apiurl = 'http://192.168.0.27:1337/';

if(window.location.host==='listme.irz.fr') {
  apiurl = 'https://listmeapi.irz.fr/';
}

$(document).ready(function() {
  new Clipboard('.btn');

  //$('.ui.basic.modal').modal();
/*
  $(document).on('click', '#settings', function () {
    $('.ui.basic.modal').modal('show');
  });
*/

$(function(){
	$("#settings").click(function(){
		$(".ui.basic.modal").modal('show');
	});
	$(".ui.basic.modal").modal({
		closable: true
	});
  $("#cancel_modal").click(function(){
    $(".ui.basic.modal").modal('hide');
  });

});

  $('#copybtn').popup({
    on : 'click'
  });

  $('#add_newlist').attr('action', apiurl + 'add_newlist');

  var engine = window.Liquid();

  $('.dimmable.image')
  .dimmer({
    on: 'hover'
  });

  /*$(document).on('DOMSubtreeModified', '#listitems', function () {
  $('.ui.checkbox').checkbox();
});
*/
$('.ui.fluid.card.full')
.dimmer({
  on: 'hover'
});

var hash = window.location.hash.substr(1);
if(hash) {
  console.log(hash);
  getList(hash, 'get/' + hash);
}

$('#listitems').on('click', '.vote', function () {
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

      $('#listitems').html(html);

    });
  },
  error: function (err) {
    console.log(err);
  }
});
}

function displayListName(list) {
  return '';
}

function existingList(data) {
  if(data.name) {
    $('#listname').html('<h1>' + data.name + '</h1>')
  }

  if(data.ip===data.currentip) {
    $('#settings').removeClass('remove');
  }

  $('#listitems-section').removeClass('remove');
  $('#add_newlist').attr('action', apiurl + 'add/' + data.id)
  $('#settings_form').attr('action', apiurl + 'settings/' + data.id)
  $('#newlist').removeClass('remove');
  $('#copyurl').val(window.location.origin + '/#' + data.id);
  $('.copylink').removeClass('remove');
  $('#newitem').attr('placeholder', '');
  $('#newitem').focus();
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
      $('.section.one').css({
        height: 200
      });

      if (!alreadyExist) {
        existingList(data);
      }
    },
    error: function (err) {
      console.log(err);
    }
  });
}


(function ($) {
  var $comments = $('.js-comments');

  $('#add_newlist, #settings_form').submit(function () {
    //e.preventDefault();
    var form = this;
    console.log($(this).attr('id'));
    $('.submitbtn').addClass('loading');
    $('#comment-form-submit').html('<i class="fa fa-spinner fa-spin fa-fw"></i> {{ site.data.ui-text[site.locale].loading_label | default: "Loading..." }}');

    $.ajax({
      dataType: "json",
      type: $(this).attr('method'),
      url: $(this).attr('action'),
      data: $(this).serialize(),
      contentType: 'application/x-www-form-urlencoded',
      success: function (data) {
        $('.submitbtn').removeClass('loading');
        // What i've gooooot ?
        console.log(data);

        // Everything is ok
        showAlert('Item Added :)))');


        $('#newitem').val('');

        // Render
        liquidRender('item.html', data);

        existingList(data)

        window.history.replaceState(null, null, '#' + data.id);

        if(data.name) {
          $('#listname').html('<h1>' + data.name + '</h1>')
        }
        $(".ui.basic.modal").modal('hide');

        // Take less height
        $('.section.one').animate({
          height: 200
        }, 600);

        hash = data.id;
      },
      error: function (err) {
        $('.submitbtn').removeClass('loading');
        console.log(err.responseJSON.error);

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
