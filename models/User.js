var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// userSchema 추가하는 곳
// schema
var userSchema = mongoose.Schema({
  username:{
    type:String,
    required:[true,'Username is required!'],
    //match:[/^.{1,12}$/,'Should be 1-12 characters!'],
    trim:true,
    unique:true
  },
  password:{
    type:String,
    required:[false,'Password is required!'],
    select:false
  },
   googleId:{
    type:String,
    trim:true
  },
   asset:{
    type:Number,
    required:[false,'초기 자금을 입력해주세요!(최대 100만원)'],
    match:[/^.{0,1000000}$/,'0~100만원까지 입력 가능합니다'],
    trim:true,
  },
  name:{
    type:String,
    required:[true,'Name is required!'],
    //match:[/^.{1,12}$/,'Should be 1-12 characters!'],
    trim:true
  },
  email:{
    type:String,
    //match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Should be a vaild email address!'],
    trim:true
  }
},{
  toObject:{virtuals:true}
});

// virtuals db에 저장안되고 비교만 하고 사라지는거
userSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
  .get(function(){ return this._originalPassword; })
  .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
  .get(function(){ return this._currentPassword; })
  .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
  .get(function(){ return this._newPassword; })
  .set(function(value){ this._newPassword=value; });

// password validation

//var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{0,16}$/;
//var passwordRegexErrorMessage = 'Should be minimum 8 characters of alphabet and number combination!';

if(!userSchema.path('password')){ // local 시작
userSchema.path('password').validate(function(v) {
  var user = this;

  // create user
  if(user.isNew){
    if(!user.passwordConfirmation){
      user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
    }

    if(!passwordRegex.test(user.password)){
      user.invalidate('password', passwordRegexErrorMessage);
    }
    else if(user.password !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
  }

  // update user
  if(!user.isNew){
    if(!user.currentPassword){
      user.invalidate('currentPassword', 'Current Password is required!');
    }
    else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){
      user.invalidate('currentPassword', 'Current Password is invalid!');
    }

    if(user.newPassword && !passwordRegex.test(user.newPassword)){
      user.invalidate("newPassword", passwordRegexErrorMessage);
    }
    else if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
  }
});
} // local 끝
// hash password
userSchema.pre('save', function (next){
  var user = this;
  if(!user.isModified('password')){
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

// model methods
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};

// model & export
var User = mongoose.model('user',userSchema);
module.exports = User;
