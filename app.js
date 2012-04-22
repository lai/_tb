
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose  = require('mongoose')
  , Schema = mongoose.Schema
  , mongooseAuth = require('mongoose-auth')
  , routes = require('./routes');

var UserSchema = new Schema({})
  , User;

UserSchema.plugin(mongooseAuth, {
    everymodule: {
      everyauth: {
          User: function () {
            return User;
          }
      }
    }
  , password: {
        loginWith: 'email'
      , extraParams: {
            name: {
                first: String
              , last: String
            }
        }
      , everyauth: {
            getLoginPath: '/login'
          , postLoginPath: '/login'
          , loginView: 'login.jade'
          , getRegisterPath: '/register'
          , postRegisterPath: '/register'
          , registerView: 'register.jade'
          , loginSuccessRedirect: '/tasks'
          , registerSuccessRedirect: '/tasks'
          , loginLocals: {title: 'Login'}
          // , methods: { updateProfile: function () {
          //               console.log("===success===");
          //               var login = "test@test.com", password="1";
          //           
          //               var promise
          //                 , errors = [];
          //               if (!login) errors.push('Missing login.');
          //               if (!password) errors.push('Missing password.');
          //               if (errors.length) return errors;
          // 
          //               promise = this.Promise();
          //               this.User()().authenticate(login, password, function (err, user) {
          //                 if (err) {
          //                   errors.push(err.message || err);
          //                   return promise.fulfill(errors);
          //                 }
          //                 if (!user) {
          //                   errors.push('Failed login.');
          //                   return promise.fulfill(errors);
          //                 }
          //                 promise.fulfill(user);
          //               });
          //               console.log("===success 2===");
          //               return promise;          
          //             }}      
        }      
    }
});



mongoose.model('User', UserSchema);

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/taskboard_dev');

User = mongoose.model('User');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'esoognom' }));
  app.use(mongooseAuth.middleware());
  //app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

function validateUser(req, res, next) {
    if (req.loggedIn) {
        next();
    } else {
        res.redirect('/');
    }
}


// Routes

app.get('/', routes.index);

app.get('/tasks', validateUser, function (req, res) {

  res.render('tasks');
});

app.get('/profile', validateUser, function (req, res) {
  //console.log(mongooseAuth.user);
  res.render('profile');
});

app.post('/profile', validateUser, function (req, res) {
  console.log(req.body);
  
  //console.log(updatedUser);

  req.user.email = req.body['email'];
  req.user.name = {'first': req.body['name.first'], 'last': req.body['name.last']};
  req.user.save(function(err) {
    if (err) {
      req.flash('error', 'update failed');
      res.render('profile');
    }
    switch (req.params.format) {
      // case 'json':
      //   var data = d.toObject();
      //   // TODO: Backbone requires 'id', but can I alias it?
      //   data.id = data._id;
      //   res.send(data);
      // break;

      default:
        req.flash('info', 'Profile updated');
        res.redirect('/tasks');
        
    }
  });
  
  // var pwd = "2";
  //   User.findById(req.user.id, function (err, user) {
  //     user.password = pwd;
  //     user.save();
  //   });  
  
});



app.get('/help', function (req, res) {
    res.render('help');
});

mongooseAuth.helpExpress(app);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
