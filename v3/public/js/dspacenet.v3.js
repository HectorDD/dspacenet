/* global jQuery */

(($) => {
  const pollingInterval = 1000;

  const $postsContainer = $('#postsContainer');
  const $processContainer = $('#processContainer');
  const $runProgramForm = $('#runProgramForm');
  const $runProgramFormLoader = $('#runProgramFormLoader');
  const $programInput = $('#programInput');
  const $skipBtn = $('#skipBtn');
  const $openTopBtn = $('#openTopBtn');
  const $postMsgBtn = $('#postMsgBtn');

  const $topModal = $('#topModal');

  const space = $('#spacePath').val();

  function runProgram(program, path, options) {
    return $.post(`/api/space/${path}`, Object.assign({ program }, options)).promise();
  }

  function getWall(id) {
    return $.get(`/api/space/wall/${id}`).promise();
  }

  function getGlobal() {
    return $.get('/api/space/global').promise();
  }

  function getSpace(path) {
    return $.get(`/api/space/${path}`);
  }

  function pushPost(message) {
    $postsContainer.append($(`
      <div class="list-group-item">
        <div class="media">
          <img class="d-flex mr-3 rounded-circle" src="/images/users/small/${message.user_msg}.jpg">
          <div class="media-body text-break">
            <strong>${message.user_msg}</strong> ${message.msg}
            <div class="text-muted smaller">PID: ${message.clock}</div>
          </div>
        </div>
      </div>
    `));
  }

  function pushProcess(message) {
    $processContainer.append($(`
      <div class="list-group-item list-group-item-action flex-column align-items-start">
        <div class="d-flex w-100 justify-content-between">
          <div class="media-body text-break">
            <strong>${message.user_msg}</strong> ${message.msg}
            <div class="text-muted smaller">PID: ${message.clock}</div>
          </div>
        </div>
      </div>
    `));
  }

  function checkPosts() {
    if ($postsContainer.children().length === 0) {
      $postsContainer.append($(`
      <div class="list-group-item">
        No post to show.
      </div>
      `));
    }
  }

  function checkProcesses() {
    if ($processContainer.children().length === 0) {
      $processContainer.append($(`
      <div class="list-group-item">
        No process running.
      </div>
      `));
    }
  }

  function updateWall() {
    getWall(space).done((data) => {
      $postsContainer.empty();
      data.forEach((message) => { if (message.user_msg !== 'private') pushPost(message); });
      checkPosts();
    }).fail((jqXHR) => {
      console.log(jqXHR.responseJSON || jqXHR.responseText);
    });
  }

  function updateGlobal() {
    getGlobal().done((data) => {
      $postsContainer.empty();
      data.forEach(message => (message.user_msg !== 'private' ? pushPost(message) : null));
      checkPosts();
    }).fail((jqXHR) => {
      console.log(jqXHR.responseJSON || jqXHR.responseText);
    });
  }

  function updateContent() {
    if (space === '0') updateGlobal(); else updateWall();
  }

  function startPolling() {
    if (space === '0') {
      setInterval(updateGlobal, pollingInterval);
    } else {
      setInterval(updateWall, pollingInterval)
    }
  }

  function showErrorMessage(message) {
    $runProgramForm.before($(`
      <div class="alert alert-danger alert-dissmisable fade show" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <strong>Error: </strong> ${message};
      </div>
    `));
  }

  function submitRunProgramForm(program) {
    $runProgramFormLoader.show();
    runProgram(program, space, {
      storeProcess: space !== '0',
    }).done(() => {
      $runProgramFormLoader.hide();
      $programInput.val('');
      updateContent();
    }).fail((jqXHR) => {
      $runProgramFormLoader.hide();
      console.log(jqXHR.responseJSON || jqXHR.responseText);
      if (jqXHR.status === 400) showErrorMessage(jqXHR.responseJSON.error);
    });
  }

  $runProgramForm.submit((event) => {
    event.preventDefault();
    submitRunProgramForm($programInput.val());
    return false;
  });

  $postMsgBtn.click(() => {
    submitRunProgramForm(`npost("${$programInput.val()}")`);
  })

  $skipBtn.click(() => {
    submitRunProgramForm('skip');
  });

  $openTopBtn.click(() => {
    getSpace(`${space}.2`).done((data) => {
      $processContainer.empty();
      data.forEach(process => pushProcess(process));
      checkProcesses();
      $topModal.modal('show');
    });
  });

  startPolling();
  updateContent();
})(jQuery);
