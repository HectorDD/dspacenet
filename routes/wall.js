var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;
var fs = require('fs');
var client = new Client();
var db_users = require('../db/users');
var Handlebars = require("hbs");
var url = require("./../config.js").url;

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});


function prepProgram(program,id_user){
 return "([".concat(program.concat("] ".concat(id_user.concat(")"))));
}


router.get('/' , function(req, res, next) {
 if (typeof req.session.user != 'undefined'){
     var mem;
     var argsPost= {
                data: { "id": req.session.id_user },
                headers: { "Content-Type": "application/json" }
              };
     client.post(url+"/getWall", argsPost , function (data, response) {
        mem = data.result;
        db_users.getFriends(req.session.id_user, function(rows,fields){
        var myFriends=rows;
        if(req.session.id_user_messages != "-1"){
           var argsPost= {
                     data: { 
                     'user_to' : req.session.id_user_messages, 
                     'user_from' : req.session.id_user },
                     headers: { "Content-Type": "application/json" }
                   };
            client.post(url+"/getMsg", argsPost , function (data, response) {
               var mf = data.messages_from;
               var mt = data.messages_to; 
               res.render('wall',{ id_user: req.session.id_user , error : req.session.var_err , messages_from : mf , messages_to : mt , user : req.session.user, user_messages : req.session.user_messages , friends : myFriends , memoria : mem });
               req.session.var_err="0";
          });
         
         }
          else{
           res.render('wall',{ id_user: req.session.id_user , error : req.session.var_err , user : req.session.user, user_messages : req.session.user_messages , friends : myFriends , memoria : mem });
           req.session.var_err="0";          
              
          }
        
        });
        
     });
 }
 else{
     res.redirect('../new');
 }
 
});



router.post('/post' , function(req, res, next) {
 var id_user = req.session.id_user.toString();
 var user = req.session.user;
 var program = req.body.config;
 if(program != "skip"){
 var programcopy = program.replace(/"/g,"'");
 program = program + ' || repeat tell("{pid:{pid}|'.concat(user.concat('} '.concat(programcopy.concat('")'))))
 } 
 var fprog = "([".concat(program.concat("] ".concat(id_user.concat(")"))));
 var argsPost= {
             data: { "config": fprog , "user": user},
             headers: { "Content-Type": "application/json" }
             };
 client.post(url+"/runsccp", argsPost , function (data, response) {
     var r = data.result;
     console.log("Result: "+r);
     if(r=="error"){
        req.session.var_err="1";
        res.redirect('../wall');
     }
     else{
        req.session.var_err="0";
        res.redirect('../wall');  
     }
     
     
  });
 
});

router.get('/newwall' , function(req, res, next) {
 res.render('newwall',{})
});

module.exports = router;
