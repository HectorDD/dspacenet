/*global jQuery*/

(($) => {
  /**
   * @todo update process list
   * @todo async skip
   */

  var recipient = {
    id:0,
    user:""
  }

  function submitForm(action) {
    var config = action ? action : $('#config').val();
    $('#errormessage').hide();
    $.post('/api/wall',{
      config:config
    }).then(function (data) { return $.get('/api/wall').promise(); })
      .then(function (data) {
       $('#wallposts').empty().append(data.filter(function (post) {
        return post.class !== "process" && post.user_msg !== 'private';
      }).map(function (post) {
        return $('<div id="wallmessage"><b>'+post.user_msg+'</b>:  '+post.msg+'</div>');
      }));
      $('#config').val('');
    }).fail(function (jqxhr) {
      $('#warning-popup').children(':first').next().empty().append(jqxhr.responseJSON.errors.map(function (error) {
        return $('<p>'+ error.error +'</p>');
      })).parent().show();
      $('#errormessage').show();
    });
  }
  $('#programform').submit(function (event) {
    event.preventDefault();
    submitForm();
    return false;
  });
  $('#privatesForm').submit(function (event) {
    event.preventDefault();
    $.post('/api/message/'+recipient.id,{
      message:$("#message").val()
    }).then(function (data) { return $.get('/api/message/'+recipient.id).promise() })
      .then(function (data) {
        $('#dmessages').empty().append(data.messagesFrom.concat(data.messagesTo).sort(function (a,b) {
          return a.clock > b.clock;
        }).each(function (message) {
          $('<div id="onemessagefrom">' + message.msg+' [pid:'+message.clock+']</di>');
        }));
      });
    return false;
  });
  $('#runsccp').off();
  $('#skip').off('click').click(function () {
    submitForm('skip');
  });
  $("[data-toggle=popover]").popover();
  $(".messageButton").click(function () {
    recipient.id = $(this).attr("data-recipient-id");
    recipient.user = $(this).attr("data-recipient");
  })
})(jQuery);