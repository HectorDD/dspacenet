'use strict';

const router = require('express').Router();
const request = require('request-json');

const config = require('./../../config');

const sccpClient = request.createClient(config.url);

function embed(program, space) {
  return `([${program}] ${space})`;
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
  sccpClient.post('/runsccp',{
    config: embed(embed(embed(req.body.message, 0), req.session.id_user), req.body.recipient),
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

module.exports = router;