/*global jQuery*/

(($) => {
  /**
   * @todo update process list
   * @todo async skip
   */

  var recipient = {
    id:0,
    user:""
  };

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

  function updatePrivateMessagesList() {
    $.get('/api/message/'+recipient.id).done(function (data) {
      $('#privateMessagesContainer').empty().append(data.messagesTo.map(function (message) {
        var html = '<div id="'+ (message.user_msg === recipient.user ? 'onemessagefrom' : 'onemessageto') + '">' + message.msg+' [pid:'+message.clock+']</di>';
        return $(html);
      }));
    });
  }
  $('#programform').submit(function (event) {
    event.preventDefault();
    submitForm();
    return false;
  });
  $('#privatesForm').submit(function (event) {
    event.preventDefault();
    if (recipient.user === "") return false;
    $.post('/api/message/'+recipient.id,{
      message:$("#message").val()
    }).done(function () { updatePrivateMessagesList() })
      .fail(function () { alert("Somithing went wrong while sending the privateMessage")} );
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
    $("#messageRecipient").text(" to "+recipient.user);
    updatePrivateMessagesList();
  })
})(jQuery);