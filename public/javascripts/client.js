// Generated by CoffeeScript 1.3.1
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    var CollapsibleView, Task, TaskListItemView, TaskListView, Tasks, createTaskView, findPeopleView, taskListView, tasks;
    _.templateSettings = {
      interpolate: /\{\{(.+?)\}\}/g
    };
    Task = (function(_super) {

      __extends(Task, _super);

      Task.name = 'Task';

      function Task() {
        return Task.__super__.constructor.apply(this, arguments);
      }

      Task.prototype.idAttribute = "_id";

      Task.prototype.collection = Tasks;

      Task.prototype.defaults = {
        name: "New Task",
        done: false
      };

      Task.prototype.toggle = function() {
        return this.save({
          done: !this.get("done")
        });
      };

      Task.prototype.clear = function() {
        this.destory();
        return this.view.remove();
      };

      return Task;

    })(Backbone.Model);
    Tasks = (function(_super) {

      __extends(Tasks, _super);

      Tasks.name = 'Tasks';

      function Tasks() {
        return Tasks.__super__.constructor.apply(this, arguments);
      }

      Tasks.prototype.model = Task;

      Tasks.prototype.url = '/tasks.json';

      Tasks.prototype.done = function() {
        return this.filter(function(t) {
          return t.get('done');
        });
      };

      Tasks.prototype.remaining = function() {
        return this.without.apply(this, this.done());
      };

      return Tasks;

    })(Backbone.Collection);
    tasks = new Tasks;
    TaskListItemView = (function(_super) {

      __extends(TaskListItemView, _super);

      TaskListItemView.name = 'TaskListItemView';

      function TaskListItemView() {
        this.open = __bind(this.open, this);

        this.render = __bind(this.render, this);
        return TaskListItemView.__super__.constructor.apply(this, arguments);
      }

      TaskListItemView.prototype.className = 'task';

      TaskListItemView.prototype.template = _.template($("#task_list_item_template").html());

      TaskListItemView.prototype.events = {
        "click": "open"
      };

      TaskListItemView.prototype.initialize = function() {
        this.model.bind('change', this.render);
        return this.model.view = this;
      };

      TaskListItemView.prototype.render = function() {
        $(this.el).html(this.template({
          taskName: this.model.get('name') || "&nbsp;",
          badgeNum: "",
          completenessMsg: "&nbsp;",
          dueMsg: "",
          createdByName: this.model.get("createdBy") === $.cookie('user_id') ? "Me" : "Other"
        }));
        return this;
      };

      TaskListItemView.prototype.open = function() {};

      TaskListItemView.prototype.remove = function() {
        return $(this.el).remove();
      };

      TaskListItemView.prototype.clear = function() {
        return this.model.clear();
      };

      return TaskListItemView;

    })(Backbone.View);
    TaskListView = (function(_super) {

      __extends(TaskListView, _super);

      TaskListView.name = 'TaskListView';

      function TaskListView() {
        this.addAll = __bind(this.addAll, this);

        this.addOne = __bind(this.addOne, this);

        this.render = __bind(this.render, this);
        return TaskListView.__super__.constructor.apply(this, arguments);
      }

      TaskListView.prototype.el = $('#tasks');

      TaskListView.prototype.initialize = function() {
        tasks.bind('add', this.addOne);
        tasks.bind('reset', this.addAll);
        tasks.bind('all', this.render);
        return tasks.fetch();
      };

      TaskListView.prototype.render = function() {};

      TaskListView.prototype.addOne = function(t) {
        var itemView;
        itemView = new TaskListItemView({
          model: t
        });
        return $(this.el).append(itemView.render().el);
      };

      TaskListView.prototype.addAll = function() {
        return tasks.each(this.addOne);
      };

      return TaskListView;

    })(Backbone.View);
    taskListView = new TaskListView;
    CollapsibleView = (function(_super) {

      __extends(CollapsibleView, _super);

      CollapsibleView.name = 'CollapsibleView';

      function CollapsibleView() {
        return CollapsibleView.__super__.constructor.apply(this, arguments);
      }

      CollapsibleView.prototype.events = {
        "click input.foldup": "close"
      };

      CollapsibleView.prototype.initialize = function() {
        var topbarLink,
          _this = this;
        topbarLink = "#" + this.el.id + "_link";
        $(this.el).on('show', function() {
          return $(topbarLink).addClass('active');
        });
        return $(this.el).on('hide', function() {
          return $(topbarLink).removeClass('active');
        });
      };

      CollapsibleView.prototype.close = function() {
        return $(this.el).collapse('hide');
      };

      return CollapsibleView;

    })(Backbone.View);
    createTaskView = new CollapsibleView({
      el: '#create_task'
    });
    findPeopleView = new CollapsibleView({
      el: '#find_people'
    });
    return createTaskView.delegateEvents({
      "submit #createTaskForm": function() {
        console.log("delegated");
        console.log(this.$('input[name]'));
        return tasks.create({
          name: this.$('input[name]').val(),
          createdBy: $.cookie('user_id')
        });
      }
    });
  });

}).call(this);
