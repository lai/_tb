
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose  = require('mongoose')
  , Schema = mongoose.Schema
  , mongooseAuth  = require('mongoose-auth')
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

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

mongooseAuth.helpExpress(app);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
