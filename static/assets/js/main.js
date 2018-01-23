// For dev or prod env
var apiurl = 'http://' + window.location.hostname + ':1337/';

if(window.location.host==='listme.irz.fr') {
  apiurl = 'https://listmeapi.irz.fr/';
}

$(document).ready(function() {
  new Clipboard('.btn');

  // Set settings modal
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

  // Copy/paste button
  $('#copybtn').popup({
    on : 'click'
  });

  // Add correct url to new list form
  $('#add_newlist').attr('action', apiurl + 'add/newlist');

  // Set Liquid engine
  var engine = window.Liquid();

  $('.dimmable.image')
  .dimmer({
    on: 'hover'
  });

  // For cards
  $('.ui.fluid.card.full')
  .dimmer({
    on: 'hover'
  });


  // Hash events
  var hash = window.location.hash.substr(1);
  if(hash) {
    console.log(hash);
    getList('get/' + hash, 'GET');
  }

  function locationHashChanged() {
    console.log('hash change detected')
    hash = window.location.hash.substr(1);
    getList('get/' + hash, 'GET');
  }

  window.addEventListener("hashchange", locationHashChanged, false);

  $('#listitems').on('click', '.vote', function () {
    var call = $(this).attr('data-call');
    console.log(call)
    getList(call, 'get', '', true);

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
        console.log('success');
        engine.parseAndRender(data, args).then(function(html) {

          $('#listitems').html(html);
          $('.ui.checkbox').checkbox({
            onChecked: function() {
              console.log($(this).data("id") );
              var url = 'add/attr/' + hash + '/' + $(this).data("id");
              getList (url, 'POST', 'check=1', true);
            },
            onUnchecked: function() {

              console.log($(this).data("id") );
              var url = 'add/attr/' + hash + '/' + $(this).data("id");
              getList (url, 'POST', 'check=0', true);
            },
          });
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


  /**
  * Set Dynamic elements to the page
  * @param {Object} data Data get from API
  */

  function existingList(data) {

    // Set name of list
    if(data.name) {
      $('#listname').html('<h1>' + data.name + '</h1>');
    } else {
      $('#listname').html('');
    }

    // Display Settings if current IP is the owner
    if(data.ip===data.currentip) {
      $('#settings').removeClass('remove');
    }

    $('#listitems-section').removeClass('remove');
    $('#add_newlist').attr('action', apiurl + 'add/' + data.id);
    $('#settings_form').attr('action', apiurl + 'settings/' + data.id);
    $('#newlist').removeClass('remove');
    $('#copyurl').val(window.location.origin + '/#' + data.id);
    $('.copylink').removeClass('remove');
    $('#newitem').attr('placeholder', '');
    $('#newitem').focus();
  }

  /**
  *  Get the list of all items and push it to #listitems
  * @param {String} path Part of URL to call API
  * @param {String} method POST/GET
  * @param {String} data Serialized data
  * @param {boolean} alreadyExist If list already exist
  */

  function getList (path, method, args, alreadyExist) {
  console.log('args',args);
    alreadyExist = alreadyExist || false;
    if (typeof(args) === "boolean") {
      alreadyExist = args;
    }
    args = args || '';

    $.ajax({
      url: apiurl + path,
      type: method,
      data: args,
      success: function(data) {
        // Render
        liquidRender('item.html', data);

        // Take less height and hide text
        $('.section.one').css({
          height: 250
        });

        $('.ui.header').hide();

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
      console.log($(this).serialize());
      $(this).find('.submitbtn').addClass('loading');
      $(this).find('.js-notice').hide();

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
          console.log('Item Added :)))');


          $('#newitem').val('');

          // Render
          liquidRender('item.html', data);

          existingList(data);

          // Add correct hash to history
          window.history.replaceState(null, null, '#' + data.id);

          if(data.name) {
            $('#listname').html('<h1>' + data.name + '</h1>');
          }
          $(".ui.basic.modal").modal('hide');

          // Take less height
          $('.section.one').animate({
            height: 250
          }, { duration: 600, queue: false } );
          $('.ui.header').hide(500);

          hash = data.id;
        },
        error: function (err) {
          const message = err.responseJSON.error || err;
          $('.submitbtn').removeClass('loading');
          $(form).removeClass('disabled');
          showAlert(form, message);
        }
      });

      return false;
    });

    function showAlert(form, message) {
      console.log(message);
      $(form).find('.js-notice').show();
      $(form).find('.js-notice-text').html(message);
    }
  })(jQuery);

});
