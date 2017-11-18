'use strict';

const express = require('express');
const router = express.Router();
const db_users = require('../db/users');

const layout = 'layouts/default';
const errorLayout = 'layouts/simple';

function getSpaceId(space, callback) {
  if (space === 'global') {
    callback(0)
  } else {
    db_users.getId(space, spaces => spaces[0] === undefined ? callback(-1) : callback(spaces[0].id_user));
  }
}

router.get('/:space' ,(req, res) => {
  getSpaceId(req.params.space, (spaceId) => {
    db_users.getFriends(req.session.userId, (friends, fields) => {
      if (spaceId === -1) {
        res.status(404).render('error', { layout:errorLayout });
      } else {
        const renderOptions = {
          spaceId,
          space:req.params.space,
          friends,
          ownSpace: spaceId === req.session.userId,
          isGlobal: spaceId === 0,
          layout:layout,
        };
        res.render('space', renderOptions);
      }
    });
  });
});

module.exports = router;
