
var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;
var fs = require('fs');
var client = new Client();
var db_users = require('../db/users');
var url = require("./../config.js").url;

router.get('/:id' , function(req, res, next) {
    req.session.id_user_messages=req.params.id;
    
    var mem;
    var argsPost= {
                data: { "id": req.params.id },
                headers: { "Content-Type": "application/json" }
              };
    console.log(argsPost);
    client.post(url+"/getWall", argsPost , function (data, response) {
        mem = data.result;
        //res.render('friend',{user : req.session.user ,memoria : r});
        db_users.getFriends(req.session.id_user, function(rows,fields){
            var myFriends=rows;
            db_users.getUser(req.params.id, function(rows,fields){
                var friendUser=rows[0].user;
                req.session.user_messages=friendUser;
                
                var argsPost= {
                     data: { 
                     'user_to' : req.session.id_user_messages, 
                     'user_from' : req.session.id_user },
                     headers: { "Content-Type": "application/json" }
                   };
               console.log(argsPost);
               client.post(url+"/getMsg", argsPost , function (data, response) {
               var mf = data.messages_from;
               var mt = data.messages_to; 
              // res.render('wall',{ messages_from : mf , messages_to : mt , user : req.session.user, user_messages : req.session.user_messages , friends : myFriends , memoria : mem });
               res.render('friend',{ id_user: req.session.id_user , error : req.session.var_err , id_friend: req.params.id , messages_from : mf , messages_to : mt , friend_user : friendUser , user : req.session.user, friends : myFriends , memoria : mem });
               req.session.var_err="0"; 
               });
                
            });
     
            
        });
    });
});


router.post('/:id1/post' , function(req, res, next) {
 
 var user_post = req.session.user;
 var id_user = req.params.id1;
 var program = req.body.config;
 if(program != "skip"){
 var programcopy = program.replace(/"/g,"'");
 console.log(programcopy);
 program = program + ' || repeat tell("{pid:{pid}|'.concat(user_post.concat('} '.concat(programcopy.concat('")'))))
 }

 var fprog = "([".concat(program.concat("] ".concat(id_user.concat(")"))));
 var argsPost= {
             data: { "config": fprog , "user" : user_post },
             headers: { "Content-Type": "application/json" }
             };
 console.log(argsPost);
 client.post(url+"/runsccp", argsPost , function (data, response) {
     r = data.result;
     if(r=="Error"){
        req.session.var_err="1";
     }
     res.redirect('../'.concat(id_user));
     console.log(r);
  });
 

});


module.exports = router;
