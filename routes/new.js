var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;
var fs = require('fs');
var client = new Client();
var db_users = require('../db/users');
const url = require('url');   

function objClone (obj) {
    return JSON.parse(JSON.stringify(obj));
}

router.get('/', function(req, res, next) {
 res.render('new', { title: 'DSpaceNet' });
});

router.post('/login' , function(req, res, next) {
 db_users.getId(req.body.user, function(rows,fields){
    if(typeof rows[0] != 'undefined'){
        if(req.body.password == rows[0].password){
            req.session.id_user=rows[0].id_user;
            req.session.user=req.body.user;
            req.session.user_messages="None";
            req.session.id_user_messages="-1";
            res.redirect('../global');
        }
        else{
            res.redirect(url.format({
            pathname:"/new",
            query: {
            "error" : "2"
                 }
            }));
        }

    }
    else{
        //res.render('new',{error: "The user doesn't exist"});
        res.redirect(url.format({
          pathname:"/new",
          query: {
          "error" : "1"
                 }
        }));
     
    }
 });
});







module.exports = router;
