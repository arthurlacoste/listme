$(document).ready(function() {

  $('.dimmable.image')
  .dimmer({
    on: 'hover'
  });

  $('.ui.checkbox')
    .checkbox()
  ;
  
  $('.ui.fluid.card.full')
  .dimmer({
    on: 'hover'
  });


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
        console.log(data)
        $('#comment-form-submit').html('{{ site.data.ui-text[site.locale].comment_btn_submitted | default: "Submitted" }}');
        $('.page__comments-form .js-notice').removeClass('notice--danger');
        $('.page__comments-form .js-notice').addClass('notice--success');
        showAlert('Merci pour votre message !');

      },
      error: function (err) {
        console.log(err);
        $('#comment-form-submit').html('{{ site.data.ui-text[site.locale].comment_btn_submit  | default: "Submit Comment" }}');
        $('.page__comments-form .js-notice').removeClass('notice--success');
        $('.page__comments-form .js-notice').addClass('notice--danger');
        showAlert('{{ site.data.ui-text[site.locale].comment_error_msg | default: "Sorry, there was an error with your submission. Please make sure all required fields have been completed and try again." }}');
        $(form).removeClass('disabled');
      }
    });

    return false;
  });

  function showAlert(message) {
    $('.page__comments-form .js-notice').removeClass('hidden');
    $('.page__comments-form .js-notice-text').html(message);
  }
  })(jQuery);
});
