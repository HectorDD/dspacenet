const router = require('express').Router();
const db = require('../helpers/db');

const layout = 'layouts/simple';

router.get('/', (req, res) => {
  if (req.session.userId !== undefined) {
    if (req.query.logout !== undefined) {
      req.session.destroy();
      res.redirect('/');
    } else res.redirect('space/global');
  } else {
    const { error } = req.session;
    req.session.error = undefined;
    res.render('login', { layout, error });
  }
});

router.post('/', (req, res) => {
  db.getId(req.body.user, (users) => {
    if (users[0] === undefined) {
      req.session.error = 'User not found';
      res.redirect('login');
    } else if (req.body.password !== users[0].password) {
      req.session.error = 'Incorrect Password';
      res.redirect('login');
    } else {
      req.session.userId = users[0].id_user;
      req.session.user = req.body.user;
      res.redirect('space/global');
    }
  });
});

module.exports = router;
