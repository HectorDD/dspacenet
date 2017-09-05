var mysql = require('mysql');
var exports = module.exports = {};
var u = require("./../config.js").dbuser;
var p = require("./../config.js").dbpassword;

var pool  = mysql.createPool({
    host     : 'localhost',
  	user     : u,
  	password : p,
  	database : 'dspacenet'
});

exports.executeSQLStatement = function(callback){
	pool.getConnection(function(err, connection){
            if(err) {
                return callback(err);
            }
            callback(connection);
		    connection.release();
});
};