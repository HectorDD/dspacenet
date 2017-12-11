/* global jQuery */

(($) => {
  // Time in miliseconds between each space posts update.
  const pollingInterval = 1000;

  // DOM Elements being used.
  const $postsContainer = $('#postsContainer');
  const $processContainer = $('#processContainer');
  const $runProgramForm = $('#runProgramForm');
  const $programInput = $('#programInput');
  const $timerPeriodInput = $('#timerPeriodInput');
  const $skipBtn = $('#skipBtn');
  const $openTopBtn = $('#openTopBtn');
  const $openTimerDialogBtn = $('#openTimerDialogBtn');
  const $runBtn = $('#runBtn');
  const $topModal = $('#topModal');
  const $timerModal = $('#timerModal');
  const $setTimerForm = $('#setTimerForm');

  // Internal Data
  const spacePath = $('#spacePath').val();

  function renderMessage(messsage) {
    return decodeURI(messsage).replace(/\n/g, '<br>');
  }

  /**
    * Requests [program] execution on [path], and return a Promise to handle
    * response
    * @param {String} program program to execute
    * @param {String} path path to the space where [program] will be executed.
    * @param {ExecutionOptions} options
    * @return {Promise}
    *
    * @typedef ExecutionOptions
    * @type {Object}
    * @property {Boolean} [storeProcess=false] - store process in TOP.
    * @property {Boolean} [advanceTimeUnit=true] - process will be executed in a
    * new time unit.
    */
  function runProgram(program, path, options) {
    return $.post(`/api/space/${path}`, Object.assign({ program }, options)).promise();
  }

  /**
   * Requests wall content of the user identified by [id], and return a promise
   * to handle the response.
   * @param {Number} id
   * @return {Promise}
   */
  function getWall(id) {
    return $.get(`/api/space/${id}`).promise();
  }

  /**
   * Requests global space contents and return a promise to handle the response.
   * @return {Promise}
   */
  function getGlobal() {
    return $.get('/api/space/global').promise();
  }

  /**
   * Request space contents in [path] and return a promise to handle the
   * response.
   * @param {String} path
   * @return {Promise}
   */
  function getSpace(path) {
    return $.get(`/api/space/${path}`);
  }

  /**
   * Appends [message] to the post container.
   * @param {Object} message
   */
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

  /**
   * Appends [message] to the process container (TOP);
   * @param {*} message
   */
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

  /**
   * Checks if there are posts in the post container, if not, a not posts
   * message is appended to the container.
   */
  function checkPosts() {
    if ($postsContainer.children().length === 0) {
      $postsContainer.append($(`
      <div class="list-group-item">
        No post to show.
      </div>
      `));
    }
  }

  /**
   * Checks if there are processes in the process container, if not, a no
   * processes message is appended to the container
   */
  function checkProcesses() {
    if ($processContainer.children().length === 0) {
      $processContainer.append($(`
      <div class="list-group-item">
        No process running.
      </div>
      `));
    }
  }

  /**
   * Update the contetnts of the wall for user spaces.
   * @todo Handle error properly.
   */
  function updateWall() {
    getWall(spacePath).done((data) => {
      $postsContainer.empty();
      data.forEach((message) => { if (message.user_msg !== 'private') pushPost(message); });
      checkPosts();
    }).fail((jqXHR) => {
      console.log(jqXHR.responseJSON || jqXHR.responseText);
    });
  }

  /**
   * Updates the content of the global space wall.
   * @todo handle error properly.
   */
  function updateGlobal() {
    getGlobal().done((data) => {
      $postsContainer.empty();
      data.forEach(message => (message.user_msg !== 'private' ? pushPost(message) : null));
      checkPosts();
    }).fail((jqXHR) => {
      console.log(jqXHR.responseJSON || jqXHR.responseText);
    });
  }

  /**
   * Update the content of the space.
   * @todo Should be implemented using Classes.
   */
  function updateContent() {
    if (spacePath === '0') updateGlobal(); else updateWall();
  }

  /**
   * Starts content update polling.
   */
  function startPolling() {
    if (spacePath === '0') {
      setInterval(updateGlobal, pollingInterval);
    } else {
      setInterval(updateWall, pollingInterval);
    }
  }

  /**
   * Displays a error [message] to the user.
   * @param {String} message
   */
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

  /**
   * Resquest execution of the given [program] and handles response from the
   * server. While program is running, a loading animation is shown in the
   * program input
   * @param {String} program
   */
  function submitRunProgramForm(program) {
    $programInput.addClass('gear-loader');
    runProgram(program, spacePath, {
      storeProcess: spacePath !== '0',
    }).done(() => {
      $programInput.removeClass('gear-loader');
      $programInput.val('');
      updateContent();
    }).fail((jqXHR) => {
      $programInput.removeClass('gear-loader');
      console.log(jqXHR.responseJSON || jqXHR.responseText);
      if (jqXHR.status === 400) showErrorMessage(jqXHR.responseJSON.error);
    });
  }

  /**
   * Encodes program in the program input and then request execution of the
   * program as a post.
   */
  function submitProgramAsMessage() {
    submitRunProgramForm(`post("${encodeURI($programInput.val())}")`);
  }

  /**
   * Handles the behavior of the Enter Key to prevent accidental form submits
   * during a multiline post.
   * @param {Event} event
   */
  function enterHandler(event) {
    if (event.which === 13 && !event.shiftKey && this.selectionEnd === this.value.length) {
      submitProgramAsMessage();
      event.preventDefault();
      return false;
    }
    return true;
  }

  // Add Enter Handler to the program input.
  $programInput.keypress(enterHandler);

  // Set submitProgramAsMessage as default submit event handler for the program
  // form.
  $runProgramForm.submit((event) => {
    event.preventDefault();
    submitProgramAsMessage();
    return false;
  });

  // Submit program in the input program when the run button is clicked.
  $runBtn.click(() => {
    submitRunProgramForm($programInput.val());
  });

  // Submit skip as program when the skip button is clicked.
  $skipBtn.click(() => {
    submitRunProgramForm('skip');
  });

  // Request TOP contents when the open TOP button is clicked and then show the
  // TOP modal.
  $openTopBtn.click(() => {
    getSpace(`${spacePath}.2`).done((data) => {
      $processContainer.empty();
      data.forEach(process => pushProcess(process));
      checkProcesses();
      $topModal.modal('show');
    });
  });

  // Show the timer modal when the open timer dialog button is clicked.
  $openTimerDialogBtn.click(() => {
    $timerModal.modal('show');
  });

  // Request to the API to set the timer for the current space when the timer
  // form is submited.
  $setTimerForm.submit((event) => {
    event.preventDefault();
    $.post(`/api/space/${spacePath}/timer/${$timerPeriodInput.val()}`).done(() => {
      $timerModal.modal('hide');
    });
    return false;
  });

  // Start content polling.
  startPolling();
  // Make the first content update to avoid waiting the fist polling.
  updateContent();
})(jQuery);
