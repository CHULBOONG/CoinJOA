var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport');
var util = require('./util');
var app = express();
var fs = require('fs');


// DB setting
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;
db.once('open', function(){
  console.log('DB connected');
});
db.on('error', function(err){
  console.log('DB ERROR : ', err);
});

// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));
//app.locals.cdata = require('./views/home/data.json'); // 로컬변수로 선언

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Custom Middlewares
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.util = util;
  next();
});

// Routes
app.use('/', require('./routes/home'));
app.use('/posts', util.getPostQueryString, require('./routes/posts'));
app.use('/users', require('./routes/users'));
app.use('/comments', util.getPostQueryString, require('./routes/comments'));
app.use('/files', require('./routes/files'));
app.use('/auth', require('./routes/auth'));

// Port setting
const PORT = process.env.PORT || 3000;
app.listen(PORT, function(){
  console.log('구동 완료 http://localhost:'+PORT);
});


var coin_num = 4;

//fix data
const cron = require("node-cron");
const task = cron.schedule("0,15,30,45 1-12 1-31 * *", () => { // 15분마다 설정
//const task = cron.schedule("0 1-12 1-31 * *", () => {
//const task = cron.schedule("*/10 * * * * *", () => { // 10초마다로 일단 설정
    console.log("매 시 정각부터 15분주기로 코인 정보가 갱신됩니다");
    var data = fs.readFileSync('views/home/data.json');
    var parsed_list = JSON.parse(data);
    for (let i = 0; i < coin_num; i++){

      var x = parsed_list['data'][i]['x'];
      var y = parsed_list['data'][i]['y'];
      
      x.push(x[x.length-1]+1);
      y.push(y[y.length-1]+(Math.random()-0.5)*20);
      parsed_list['data'][i]['x'] = x;
      parsed_list['data'][i]['y'] = y;

    };
    let update_json = JSON.stringify(parsed_list);
    fs.writeFileSync('views/home/data.json',update_json);
    let today = new Date();   
    console.log('Data Changed! ' + today);
    console.log('Update complete');
}, {
    scheduled: false
});

task.start();