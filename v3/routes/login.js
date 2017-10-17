const router = require('express').Router();
const db_users = require('../../db/users');

const view = __dirname + '/../templates/views/login';
const layout = '../v3/templates/views/layouts/simple';

router.get('/',(req, res) => {
  if (req.session.userId !== undefined)
    res.redirect('space/global');
  else {
    const error = req.session.error;
    req.session.error = undefined;
    res.render(view, { layout, error });
  }
});

router.post('/', (req, res) => {
  db_users.getId(req.body.user, (users) => {
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