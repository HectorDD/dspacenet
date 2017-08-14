var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;
var fs = require('fs');
var client = new Client();
var url = require("./../config.js").url;

/* GET home page. */
router.get('/', function(req, res, next) {
 res.redirect('new');
 ///res.render('index', { title: 'DSpaceNet' });
});


router.get('/prev', function(req, res, next) {

  fs.readFile('memory.txt', 'utf-8', (err, data) => {
  if(err) {
    console.log('error: ', err);
  } else {
    console.log(data);
    res.render('prev', { title: 'DSpaceNet' , memoria: data });
  }
 });
});



router.post('/', function(req, res, next) {
    var r;
    var con = req.body.config ;
    //print(req.body);
    var argsPost= {
                data: { "config": con },
                headers: { "Content-Type": "application/json" }
              };
    console.log(argsPost);
    client.post(url+"/runsccp", argsPost , function (data, response) {
        r = data.result;
        res.json({result : r});
        //res.render({result : r});
        console.log(r);
    });
});

router.get('/logout' , function(req, res, next) {
 delete req.session.user;
 delete req.session.id;
 res.redirect('/new');
});




module.exports = router;
