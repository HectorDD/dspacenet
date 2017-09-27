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


router.get('/' , function(req, res, next) {
    client.get(url+"/getGlobal", function (data, response) {
    // parsed response body as js object 
    var r=data.result;
    res.render('global',{ errors : req.session.var_errs , memoria : r , id_user: req.session.id_user , error : req.session.var_err , user : req.session.user, user_messages : req.session.user_messages });

    });
    
    
});

router.post('/post' , function(req, res, next) {
 var id_user = req.session.id_user.toString();
 var user = req.session.user;
 var fprog = req.body.config;
 var argsPost= {
             data: { "config": fprog , "user": user},
             headers: { "Content-Type": "application/json" }
             };
 client.post(url+"/runsccp", argsPost , function (data, response) {
     var r = data.result;
     console.log("Result: "+r);
     if(r=="error"){
        req.session.var_errs=data.errors; 
        req.session.var_err="1";
        res.redirect('../global');
     }
     else{
        req.session.var_errs="";
        req.session.var_err="0";
        res.redirect('../global');  
     }
  });
 
});


module.exports = router;