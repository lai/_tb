
// Module dependencies

var express = require('express')
  , mongoose  = require('mongoose')
  , mongooseAuth = require('mongoose-auth')
  , routes = require('./routes');

var app, Schema, ObjectId, Users, User, Tasks, Task;

Schema = mongoose.Schema;
ObjectId = mongoose.SchemaTypes.ObjectId;

Users = new Schema({
    //email: { type: String, lowercase: true, index: { unique: true, sparse: true } }
  contacts: [{ type: Schema.ObjectId, ref: 'User'}]
});

Users.plugin(mongooseAuth, {
    everymodule: {
      everyauth: {
          User: function () {
            return User;
          }
        , handleLogout: function (req, res) {
            res.clearCookie('user_id');
            req.logout();
            this.redirect(res, this.logoutRedirectPath());
          }
      }
    }
  , password: {
        loginWith: 'email'
      , extraParams: {
            name: {
                first: { type: String, required: true}
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
          , respondToRegistrationSucceed: function (res, user, data) {
                res.cookie('user_id', user._id, { expires: 0 });                
                this.redirect(res, '/tasks');
            }
          , respondToLoginSucceed: function (res, user, data) {
                res.cookie('user_id', user._id, { expires: 0 });                
                this.redirect(res, '/tasks');
            }
          , loginLocals: {title: 'Login'}  
          , registerLocals: {title: 'Register'}  
        }
    }
});

var Actions = new Schema({
    name : String
  , done : { type: Boolean, default: false }
});

var Tasks = new Schema({
    name: { type: String, default: "New Task" }
  , dueDate: Date
  , done: { type: Boolean, default: false }
  , createDate: { type: Date, default: Date.now }
  , createdBy: { type: Schema.ObjectId, ref: 'User' }
  , actions: [Actions]
  , assignedTo: [{ type: Schema.ObjectId, ref: 'User'}]
});

mongoose.model('User', Users);
mongoose.model('Task', Tasks);

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/taskboard_dev');

User = mongoose.model('User');
Task = mongoose.model('Task');

app = module.exports = express.createServer();

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

app.get('/tasks.json', validateUser, function(req, res) {
  Task.find(function(err, documents) {
      res.send(documents.map(function(d) {
        return d.toObject();
      }));
  });
});

// Create task 
app.post('/tasks.json', validateUser, function(req, res) {
  //console.log(req.body);
  var t = new Task(req.body);
  //t.assignedTo.push(req.user);
  console.log(t);
  //t.createdBy = req.user._id;
  t.save(function(err) {
    if (err)
      console.log("failed"+err);
    var data = t.toObject();
    console.log("task saved!");
    res.send(data);
  });
});

// Update task
app.put('/tasks/:id.:format?', validateUser, function(req, res) {
  console.log(req.body.actions);
  console.log(req.params.id)
  Task.update({ _id: req.params.id }, {actions: req.body.actions}, false, false, function(err, t) {
    // if (!t) return next('Task not found');
    t = req.body;
    console.log(err);
    res.send(t.toObject());
  });
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
