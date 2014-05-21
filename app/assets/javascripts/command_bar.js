function applyCommandBarActions($btnGroup) {
  autofocusInput($btnGroup);
  applyTextcomplete($btnGroup);
};

function autofocusInput($btnGroup) {
  var $dropdownToggle = $('.dropdown-toggle', $btnGroup);
  var $input = $('input', $btnGroup);

  $dropdownToggle.click(function() {
    setTimeout(function() {
      $input.focus();
    }, 0);
  });

  $input.click(function(e) {
    e.stopPropagation();
  });
}

function applyTextcomplete($btnGroup) {
  var textcompletesPath = $btnGroup.attr('data-textcomplete-path');
  var $input = $('input', $btnGroup);
  var $dropdownToggle = $('.dropdown-toggle', $btnGroup);
  var $dropdown = $('.dropdown-menu', $btnGroup);
  var $divider = $('li.divider', $dropdown);
  var searchType = $dropdownToggle.attr('data-search'); 
  var searchTimeout;
  var actionResultsTemplate = Handlebars.compile($('#action-results-template').html());
  var actionResultsContainer = $('.action-results-container', $btnGroup);

  $input.keypress(function() {
    if(searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(function() {
      $.getJSON(
        textcompletesPath,
        {
          query: $input.val(),
          query_type: searchType
        },
        function(results) {
          $divider.nextAll().remove();
          $divider.after(actionResultsTemplate(results));
        }
      );
    });
  });

  $btnGroup.on('click', 'li a', function() { 
    switch(searchType) {
      case 'assignments':
        assignConversation($(this));
        break;
      case 'tags':
        tagConversation($(this));
        break;
      case 'canned_responses':
        useCannedResponse($(this));
        break;
    };
  });

  var tagConversation = function($anchor) {
    var account = $("[name='account-slug']").val();
    var conversation = $("[name='conversation-number']").val();
    var tagConversationPath = '/' + account + '/' + conversation + '/tags';

    $.post(
      tagConversationPath,
      { tag: $anchor.attr('data-value') },
      function() { window.location.reload(); },
      'json'
    );

    return false;
  };

  var assignConversation = function($anchor) {
    var account = $("[name='account-slug']").val();
    var conversation = $("[name='conversation-number']").val();
    var conversationPath = '/' + account + '/' + conversation;

    $.post(
      conversationPath,
      { conversation: { user_id: $anchor.attr('data-user-id') }, _method: 'patch' },
      function() { window.location.reload(); },
      'json'
    );

    return false;
  };

  var useCannedResponse = function($anchor) {
    var $replyMessage = $('[data-reply-to-message]');
    var account = $("[name='account-slug']").val();
    var cannedResponsePath = '/' + account + '/canned_responses/' + $anchor.attr('data-id');

    $.getJSON(
      cannedResponsePath,
      function(cannedResponse) {
        $replyMessage.html(cannedResponse.message);
      }
    );

    return false;
  };
};


$(document).on('ready page:load', function() {
  $('.command-bar-action').each(function() {
    applyCommandBarActions($(this));
  });

  $('.dropdown-menu input').click(function(e) {
    e.stopPropagation();
  });
});
