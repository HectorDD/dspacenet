var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;
var client = new Client();
var urlrest = require("./../config.js").url;

function fProg(program,id_user){
  id_user=id_user.toString();
  var fprog = "([".concat(program.concat("] ".concat(id_user.concat(")"))));
  return fprog;
}


function sendMsg (res,req,user_msg,msg,user_from,user_to) {
    var r;
    var con = fProg(fProg(fProg(msg,user_from),"0"),user_to);
    var argsPost= {
                data: { "config": con , "user" : user_msg },
                headers: { "Content-Type": "application/json" }
              };
    console.log(argsPost);
    client.post(urlrest+"/runsccp", argsPost , function (data, response) {
        r = data.result;
        console.log(r);
          if(r=="Error"){
      req.session.var_err="1";
        }
        res.redirect('wall');
        console.log("errorsillo: ".concat(req.session.var_err));
        return r;
        //
    });

}

function sendMsgF (id1,res,req,user_msg,msg,user_from,user_to) {
    var r;
    var con = fProg(fProg(fProg(msg,user_from),"0"),user_to);
    var argsPost= {
                data: { "config": con , "user" : user_msg },
                headers: { "Content-Type": "application/json" }
              };
    console.log(argsPost);
    client.post(urlrest+"/runsccp", argsPost , function (data, response) {
        r = data.result;
        console.log(r);
          if(r=="Error"){
      req.session.var_err="1";
        }
        res.redirect('../friend/'.concat(id1));
        console.log("errorsillo: ".concat(req.session.var_err));
        return r;
        //
    });

}


router.get('/:id1/:user' , function(req, res, next) {
  req.session.user_messages=req.params.user;
  req.session.id_user_messages=req.params.id1;

  res.redirect('../../wall');
});

router.post('/' , function(req, res, next) {
  console.log(req.session.id_user);
  console.log(req.session.id_user_messages);
  var user_msg = req.session.user;
  var r = sendMsg(res,req,user_msg,req.body.message,req.session.id_user,req.session.id_user_messages);


});

router.post('/:id1' , function(req, res, next) {
  console.log(req.session.id_user);
  console.log(req.session.id_user_messages);
  var user_msg = req.session.user;
  var r = sendMsgF(req.params.id1,res,req,user_msg,req.body.message,req.session.id_user,req.session.id_user_messages);

});


router.get('/' , function(req, res, next) {
  if(req.session.user_messages != "None"){
    var mem;
    console.log("user_message :".concat(req.session.id_user_messages))
    console.log("user :".concat(req.session.id_user))
      var argsPost= {
                  data: {
                  'user_to' : req.session.id_user_messages,
                  'user_from' : req.session.id_user },
                  headers: { "Content-Type": "application/json" }
                };
       console.log(argsPost);
       client.post(urlrest+"/getMsg", argsPost , function (data, response) {
          var mf = data.messages_from;
          var mt = data.messages_to;
          res.json({"mf" : mf , "mt" : mt});
       });
  }
});






module.exports = router;