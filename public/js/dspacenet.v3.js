/* global jQuery */

(($) => {
  // Time in miliseconds between each space posts update.
  const pollingInterval = 1000;

  // DOM Elements being used.
  const $postsContainer = $('#postsContainer');
  const $processContainer = $('#processContainer');
  const $runProgramForm = $('#runProgramForm');
  const $runProgramFormLoader = $('#runProgramFormLoader');
  const $programInput = $('#programInput');
  const $skipBtn = $('#skipBtn');
  const $openTopBtn = $('#openTopBtn');
  const $postMsgBtn = $('#postMsgBtn');
  const $runBtn = $('#runBtn');
  const $topModal = $('#topModal');

  // Internal Data
  const spacePath = $('#spacePath').val();

  function renderMessage(messsage) {
    return decodeURI(messsage).replace(/\n/g,'<br>');
  }

  /**
    * Executes [program] in [path]
    * @param {String} program program to execute
    * @param {String} path path to the space where [program] will be executed.
    * @param {ExecutionOptions} options
    *
    * @typedef ExecutionOptions
    * @type {Object}
    * @property {Boolean} [storeProcess=false] store process in TOP.
    * @property {Boolean} [advanceTimeUnit=true] process will be executed in a new time unit.
    */
  function runProgram(program, path, options) {
    return $.post(`/api/space/${path}`, Object.assign({ program }, options)).promise();
  }

  function getWall(id) {
    return $.get(`/api/space/${id}`).promise();
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
            <strong>${message.user_msg}</strong> ${renderMessage(message.msg)}
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
            <strong>${message.user_msg}</strong> ${decodeURI(message.msg)}
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
    getWall(spacePath).done((data) => {
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
    if (spacePath === '0') updateGlobal(); else updateWall();
  }

  function startPolling() {
    if (spacePath === '0') {
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
    runProgram(program, spacePath, {
      storeProcess: spacePath !== '0',
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

  function submitProgramAsMessage() {
    submitRunProgramForm(`npost("${encodeURI($programInput.val())}")`);
  }

  $programInput.keypress(function(event) {
    if(event.which === 13 && !event.shiftKey && this.selectionEnd === this.value.length) {
      submitProgramAsMessage()
      event.preventDefault();
      return false;
    }
    return true
  });

  $runProgramForm.submit((event) => {
    event.preventDefault();
    submitProgramAsMessage()
    return false;
  });

  $runBtn.click(() => {
    submitRunProgramForm($programInput.val());
  })

  $skipBtn.click(() => {
    submitRunProgramForm('skip');
  });

  $openTopBtn.click(() => {
    getSpace(`${spacePath}.2`).done((data) => {
      $processContainer.empty();
      data.forEach(process => pushProcess(process));
      checkProcesses();
      $topModal.modal('show');
    });
  });

  startPolling();
  updateContent();
})(jQuery);
