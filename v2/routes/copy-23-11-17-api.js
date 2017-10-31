'use strict';

const router = require('express').Router();
const request = require('request-json');

const config = require('./../../config');

const sccpClient = request.createClient(config.url);

function embed(program, space) {
  return `([${program}] ${space})`;
}

function spaceWrap(program, path) {
  if (path === '') return program;
  let result = program;
  `${path}`.split('.').forEach(spaceId => result = `([${result}] ${spaceId})`);
  return result;
}

router.get('/wall/', (req, res) => {
  if (req.session.user === undefined)
    res.json({error:'logged out'}).end();
  else {
    sccpClient.post('/getWall', { id: req.session.id_user }, (err, res2, body) => {
      if (err)
        return res.status(504).json({ success: false, error: err });
      res.json(body.result).end();
    });
  }
});

router.post('/wall/', (req, res) => {
  const program = req.body.config === 'skip' ? 'skip' :
    `${req.body.config} || repeat tell("{pid:{pid}|${req.session.user}} ${req.body.config.replace(/"/g,'\'')}")`;
  sccpClient.post('/runsccp',{
    config: embed(program,req.session.id_user),
    user: req.session.user
  }, (err, res2, body) => {
    if (err)
      return res.status(504).json({ success: false, error: err });
    if (body.result !== 'error')
      res.json({ success: true });
    else res.status(400).json({ success: false, errors: body.errors });
  });
});

router.post('/message/:recipient/', (req, res) => {
  var config = embed(embed(embed(req.body.message, req.session.id_user), 0), req.params.recipient);
  sccpClient.post('/runsccp',{
    config: config,
    user: req.session.user
  }, (err, res2, body) => {
    if (err)
      return res.status(504).json({ success: false, error: err });
    if (body.result !== 'error')
      res.json({ success: true });
    else res.status(400).json({ success: false, errors: body.errors });
  });
});

router.get('/message/:recipient/', (req, res) => {
  sccpClient.post('/getMsg', {
    'user_to': req.params.recipient,
    'user_from': req.session.id_user,
  }, (err, res2, body) => {
    if (err)
      return res.status(504).json({ success: false, error: err });
    res.json({
      messagesFrom: body.messages_from,
      messagesTo: body.messages_to
    });
  });
});

router.get('/space/wall/:spaceId',(req, res) => {
  sccpClient.post('/getWall', { id: req.params.spaceId }, (err, res2, body) => {
    if (err)
      res.status(504).json({error: err });
    else
      res.json(body.result);
    res.end();
  });
});

router.post('/space/:path', (req, res) => {
  const path = req.params.path === '0' ? '' : req.params.path;
  const program = req.body.storeProcess !== "true" ?
      req.body.program :
    req.body.program === 'skip' ?
      'skip' :
      `${req.body.program} || repeat tell("{pid:{pid}|${req.session.user}} ${req.body.program.replace(/"/g,'\'')}")`;
  sccpClient.post('/runsccp',{
    config: spaceWrap(program, path),
    user: req.session.user
  }, (err, res2, body) => {
    if (err)
      return res.status(504).json({error: err });
    else if (body.result === "error") {
      let result = "";
      body.errors.forEach(error => result = `${result} ${error.error}`);
      res.status(400).json({error: result});
    } else
      res.json({ success: true });
    res.end();
  });
});

router.get('/space/global/' , function(req, res, next) {
    sccpClient.get('/getGlobal', (err, res2, body) => {
    if (err)
      res.status(504).json({error: err });
    else
      res.json(body.result);
    res.end();
    });
});

module.exports = router;
