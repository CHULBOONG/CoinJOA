var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../util');
var fs = require('fs');
const cron = require("node-cron");
const { request } = require('http');

// New
router.get('/new', function(req, res){
  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('users/new', { user:user, errors:errors });
});

// create
router.post('/', function(req, res){
  User.create(req.body, function(err, user){
    if(err){
      req.flash('user', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/users/new');
    }
    res.redirect('/');
  });
});


// asset

var data;
data = fs.readFileSync('views/home/data.json'); // 한번 읽고시작 
const task = cron.schedule("*/10 * * * * *", () => { // 10초마다 업데이트
  data = fs.readFileSync('views/home/data.json');
});
task.start();

//var data = "<%= data %>";
// data = data.replace(/&#34;/g,'"');
data = JSON.parse(data);
var y_length = (data['data'][0]['y'].length)-1;
var ctc_y = data['data'][0]['y'][y_length].toFixed(2);
var map_y = data['data'][1]['y'][y_length].toFixed(2);
var cau_y = data['data'][2]['y'][y_length].toFixed(2);
var skku_y = data['data'][3]['y'][y_length].toFixed(2);

router.get('/:username/asset', util.isLoggedin, function(req, res){
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
//    res.render('users/asset', {data: text, username:req.params.username, user:user, asset:req.params.asset});
    res.render('users/asset', {ctc: ctc_y, map:map_y,cau:cau_y, skku:skku_y, username:req.params.username, user:user, asset:req.params.asset});
  });
});


// asset update

router.put('/:username/assetupdate', util.isLoggedin,  function(req, res, next){
var selectedcoin = req.body.whatcoin.split(' ');
var coin_name = selectedcoin[0];
var coin_value = parseInt(selectedcoin[1]);
  console.log(req.user.username + "님이 " + coin_name + "을 " + coin_value + "의 가격에" + req.body.howmany + "만큼" + req.body.whatdo + "하려고 합니다.");
 
  User.findOne({username:req.params.username})
    .exec(function(err, user){
      if(err) return res.json(err);
//구매
      if ( req.body.whatdo == "buy"){
         if( user.asset < parseInt(req.body.howmany) * coin_value ){
          console.log("금액이 부족하여 진행되지 않았습니다!");
          res.render('users/asset', {ctc: ctc_y, map:map_y,cau:cau_y, skku:skku_y, username:req.params.username, user:user, asset:req.params.asset});
         }
         user.asset = user.asset - parseInt(req.body.howmany) * coin_value;
         if(coin_name == "CTC"){
          user.hasCTC += parseInt(req.body.howmany);
         }
         if(coin_name == "Maplestory"){
          user.hasMapleStory += parseInt(req.body.howmany);
         }
         if(coin_name == "CAU"){
          user.hasCAU += parseInt(req.body.howmany);
         }
         if(coin_name == "SKKU"){
          user.hasSKKU += parseInt(req.body.howmany);
         }
         res.render('users/asset', {ctc: ctc_y, map:map_y,cau:cau_y, skku:skku_y, username:req.params.username, user:user, asset:req.params.asset});

      }
//판매
if ( req.body.whatdo == "sell"){
  if( user.asset < parseInt(req.body.howmany) * coin_value ){
   console.log("금액이 부족하여 진행되지 않았습니다!");
   res.render('users/asset', {ctc: ctc_y, map:map_y,cau:cau_y, skku:skku_y, username:req.params.username, user:user, asset:req.params.asset});
  }
  user.asset = user.asset - parseInt(req.body.howmany) * coin_value;
  if(coin_name == "CTC"){
   user.hasCTC += parseInt(req.body.howmany);
  }
  if(coin_name == "Maplestory"){
   user.hasMapleStory += parseInt(req.body.howmany);
  }
  if(coin_name == "CAU"){
   user.hasCAU += parseInt(req.body.howmany);
  }
  if(coin_name == "Maplestory"){
   user.hasSKKU += parseInt(req.body.howmany);
  }
  res.render('users/asset', {ctc: ctc_y, map:map_y,cau:cau_y, skku:skku_y, username:req.params.username, user:user, asset:req.params.asset});

}
  
      // // update user object
      // user.originalPassword = user.password;
      // user.password = req.body.newPassword? req.body.newPassword : user.password;
      // for(var p in req.body){
      //   user[p] = req.body[p];
      // }

      // // save updated user
      // user.save(function(err, user){
      //   if(err){
      //     req.flash('user', req.body);
      //     req.flash('errors', util.parseError(err));
      //     return res.redirect('/users/'+req.params.username+'/edit');
      //   }
      //   res.redirect('/users/'+user.username);
      // });
    });
  });
//  });
//});
  


// show
router.get('/:username', util.isLoggedin, checkPermission, function(req, res){
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
    res.render('users/show', {user:user});
  });
});

// edit
router.get('/:username/edit', util.isLoggedin, checkPermission, function(req, res){
  var user = req.flash('user')[0];
  var errors = req.flash('errors')[0] || {};
  if(!user){
    User.findOne({username:req.params.username}, function(err, user){
      if(err) return res.json(err);
      res.render('users/edit', { username:req.params.username, user:user, errors:errors });
    });
  }
  else {
    res.render('users/edit', { username:req.params.username, user:user, errors:errors });
  }
});

// update
router.put('/:username', util.isLoggedin, checkPermission, function(req, res, next){
  User.findOne({username:req.params.username})
    .select('password')
    .exec(function(err, user){
      if(err) return res.json(err);

      // update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword? req.body.newPassword : user.password;
      for(var p in req.body){
        user[p] = req.body[p];
      }

      // save updated user
      user.save(function(err, user){
        if(err){
          req.flash('user', req.body);
          req.flash('errors', util.parseError(err));
          return res.redirect('/users/'+req.params.username+'/edit');
        }
        res.redirect('/users/'+user.username);
      });
  });
});

module.exports = router;

// private functions
function checkPermission(req, res, next){
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
    if(user.id != req.user.id) return util.noPermission(req, res);

    next();
  });
}