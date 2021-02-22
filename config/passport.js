var passport = require('passport');
var bcrypt = require('bcryptjs'); // bcryptjs pacakge를 bcrypt 변수에 담음
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy   = require('passport-google-oauth2').Strategy;
var User = require('../models/User');

// serialize & deserialize User
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findOne({_id:id}, function(err, user) {
    done(err, user);
  });
});

//Google login
passport.use(new GoogleStrategy(
  {
    clientID      : process.env.GOOGLE_CLIENT_ID,
    clientSecret  : process.env.GOOGLE_SECRET,
    callbackURL   : '/auth/google/callback',
    passReqToCallback   : true
  }, function(request, accessToken, refreshToken, profile, done){
    console.log('profile: ', profile);
    //var user = profile;
    User.findOne({googleId: profile.id}, function (err, user)  {
    if(user){
        return done(null, user);
    }
    else {
        var newUser={
           username: profile.displayName,
          //  password: /* 구글 로그인은 비번안받음 수정 필요 */ ,
           googleId: profile.id,
           asset: '1000000',
           name: profile.displayName
        };
        User.create(newUser, function (err, user) {
          return done(null, user);
        });
    }
})
}
));

// local strategy
passport.use('local-login',
  new LocalStrategy({
      usernameField : 'username',
      passwordField : 'password',
      passReqToCallback : true
    },
    function(req, username, password, done) {
      User.findOne({username:username})
        .select({password:1})
        .exec(function(err, user) {
          if (err) return done(err);

          if (user && user.authenticate(password)){
            return done(null, user);
          }
          else {
            req.flash('username', username);
            req.flash('errors', {login:'The username or password is incorrect.'});
            return done(null, false);
          }
        });
    }
  )
);

module.exports = passport;
