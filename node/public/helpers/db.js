const mysql = require('mysql');

const config = require("../config")

const db = mysql.createPool({
  host: 'localhost',
  user: process.env.MYSQL_USER || config.dbuser,
  password: process.env.MYSQL_PASSWORD || config.dbpassword,
  database: process.env.MYSQL_DATABASE || 'dspacenet',
});

function getId(user, callback) {
  db.query('select id_user,password from users where user=?', [user], (err, rows) => {
    if (err) throw err;
    callback(rows);
  });
}


function getFriends(iduser, callback) {
  db.query('select id_user2,user from friends , users where friends.id_user2=users.id_user and friends.id_user1=?', [iduser], (err, rows) => {
    if (err) throw err;
    callback(rows);
  });
}

function getUser(idUser, callback) {
  db.query('select user from users where id_user=?', [idUser], (err, rows) => {
    if (err) throw err;
    callback(rows);
  });
}

module.exports = { getId, getFriends, getUser };
