var express = require('express');
var router = express.Router();
var passport = require('../config/passport');
var fs = require('fs');
const cron = require("node-cron");


// Home
router.get('/', function(req, res){
  res.render('home/welcome');
});
router.get('/about', function(req, res){
  res.render('home/about');
});

//Coin 그래프

var text;

text = fs.readFileSync('views/home/data.json'); // 한번 읽고시작 

const task = cron.schedule("*/10 * * * * *", () => { // 10초마다 업데이트
  text = fs.readFileSync('views/home/data.json');
});
task.start();



router.get('/coin', function(req, res){

  res.render('home/coin',{data: text});

});



router.get('/login/google',
  passport.authenticate('google', { scope: ['profile'] })
);

router.get('/google/callback',
  passport.authenticate('google'), authSuccess
);

function authSuccess(req, res) {
  res.redirect('/');
}

// Login
router.get('/login', function (req,res) {
  var username = req.flash('username')[0];
  var errors = req.flash('errors')[0] || {};
  res.render('home/login', {
    username:username,
    errors:errors
  });
});

// Post Login
router.post('/login',
  function(req,res,next){
    var errors = {};
    var isValid = true;

    if(!req.body.username){
      isValid = false;
      errors.username = 'Username is required!';
    }
    if(!req.body.password){
      isValid = false;
      errors.password = 'Password is required!';
    }

    if(isValid){
      next();
    }
    else {
      req.flash('errors',errors);
      res.redirect('/login');
    }
  },
  passport.authenticate('local-login', {
    successRedirect : '/posts',
    failureRedirect : '/login'
  }
));

// Logout
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
