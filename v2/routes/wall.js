'use strict';

const express = require('express');
const router = express.Router();
const Client = require('node-rest-client').Client;
const client = new Client();
const db_users = require('../../db/users');
const url = require("./../../config.js").url;
const path = require('path');

const view = path.join(__dirname, '/../templates/views/wall');


router.get('/' ,(req, res) => {
  client.post(url+"/getWall", {
    data: { "id": req.session.id_user },
    headers: { "Content-Type": "application/json" }
  }, (data, response) => {
    db_users.getFriends(req.session.id_user, (myFriends,fields) => {
      const renderOptions = {
        errors: req.session.var_errs,
        id_user: req.session.id_user,
        error: req.session.var_err,
        user: req.session.user,
        user_messages: req.session.user_messages,
        friends: myFriends,
        memoria: data.result,
      };
      req.session.var_err="0";
      req.session.var_errs="";
      res.render(view, renderOptions);
    });
  });
});

module.exports = router;
