var exports = module.exports = {};
var connect = require("./connect.js");


exports.getId=function(user,f){
	connect.executeSQLStatement(function(connect){
		connect.query("select id_user,password from users where user=?",[user],function(err,rows,fields){
			if(err) throw err;
			f(rows);
		});
	});
};


exports.getFriends=function(iduser,f){
	connect.executeSQLStatement(function(connect){
		connect.query("select id_user2,user from friends , users where friends.id_user2=users.id_user and friends.id_user1=?",[iduser],function(err,rows,fields){
			if(err) throw err;
			f(rows);
		});
	});
};

exports.getUser=function(id_user,f){
	connect.executeSQLStatement(function(connect){
		connect.query("select user from users where id_user=?",[id_user],function(err,rows,fields){
			if(err) throw err;
			f(rows);
		});
	});
};
