'use strict'

const router = require('express').Router();
const nodeCrontab = require('crontab');

const runSCCP = require('../helpers/sccpClient').runSCCP;
const sccpClient = require('../helpers/sccpClient').sccpClient;

// router.post('/message/:recipient/', (req, res) => {
//   var config = embed(embed(embed(req.body.message, req.session.id_user), 0), req.params.recipient);
//   sccpClient.post('/runsccp',{
//     config: config,
//     user: req.session.user
//   }, (err, res2, body) => {
//     if (err) {
//       res.status(504).json({ success: false, error: err });
//     } else if (body.result !== 'error') {
//       res.json({ success: true });
//     } else res.status(400).json({ success: false, errors: body.errors });
//   });
// });

// router.get('/message/:recipient/', (req, res) => {
//   sccpClient.post('/getMsg', {
//     'user_to': req.params.recipient,
//     'user_from': req.session.id_user,
//   }, (err, res2, body) => {
//     if (err) {
//       res.status(504).json({ success: false, error: err });
//     } else {
//       res.json({
//         messagesFrom: body.messages_from,
//         messagesTo: body.messages_to
//       });
//     }
//   });
// });

router.get('/space/global/' , function(req, res, next) {
    sccpClient.get('/getGlobal', (err, res2, body) => {
    if (err) {
      res.status(504).json({error: err });
    } else res.json(body.result);
    res.end();
    });
});

router.get('/space/:path', (req, res) => {
  sccpClient.post('/getSpace', { id: req.params.path.split('.') }, (err, res2, body) => {
    if (err) {
      res.status(504).json({error: err});
    } else {
      res.json(body.result);
    }
    res.end();
  });
});

router.get('/space/wall/:spaceId',(req, res) => {
  sccpClient.post('/getWall', { id: req.params.spaceId }, (err, res2, body) => {
    if (err) {
      res.status(504).json({error: err });
    } else res.json(body.result);
    res.end();
  });
});

router.get('/space/:path/timer/:timer', (req, res) => {
  const path = req.params.path === '0' ? '' : req.params.path;
  const timer = parseInt(req.params.timer, 10);
  nodeCrontab.load((err, crontab) => {
    if (err) {
      res.status(504).json({ error: err }).end();
    } else {
      crontab.remove({ comment: new RegExp(`p${path}\$`) });
      if (timer !== 0) {
        crontab.create(`node ${__dirname}/../helpers/tickWorker.js ${path}`, null, `p${path}$ > cronWorker.txt`).minute().every(timer);
        crontab.save((err2) => {
          if (err2) {
            res.status(400).json({ error: err2 }).end();
          } else {
            res.status(200).json({ success: true }).end();
          }
        });
      } else res.status(200).json({ success: true}).end();
    }
  });
});

router.post('/space/:path', (req, res) => {
  const path = req.params.path === '0' ? '' : req.params.path;
  const program = req.body.storeProcess !== "true" ?
      req.body.program :
    req.body.program === 'skip' ?
      'skip' :
      `${req.body.program} || enter @ "top" do post("${req.body.program.replace(/"/g,'\'')}")`;
  runSCCP(program, path, req.session.user).then((result) => {
    const body = result.body;
    if (body.result === "error") {
      let result = "";
      body.errors.forEach(error => {result = `\n${result} ${error.error}`});
      res.status(400).json({error: result}).end();
    } else res.json({ success: true }).end();
  }).catch(error => res.status(504).json({ error }).end());
});

module.exports = router;
