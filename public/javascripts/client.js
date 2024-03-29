// Generated by CoffeeScript 1.3.1
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    var ActionItemContentView, ActionItemFormView, ActionsFormView, AppStatus, CollapsibleView, Task, TaskContentView, TaskListItemView, TaskListView, Tasks, actionsFormView, appStatus, createTaskView, findPeopleView, taskListView, tasks;
    _.templateSettings = {
      interpolate: /\{\{(.+?)\}\}/g
    };
    AppStatus = (function(_super) {

      __extends(AppStatus, _super);

      AppStatus.name = 'AppStatus';

      function AppStatus() {
        return AppStatus.__super__.constructor.apply(this, arguments);
      }

      AppStatus.prototype.defaults = {
        selectedTask: null
      };

      return AppStatus;

    })(Backbone.Model);
    appStatus = new AppStatus;
    Task = (function(_super) {

      __extends(Task, _super);

      Task.name = 'Task';

      function Task() {
        this.url = __bind(this.url, this);
        return Task.__super__.constructor.apply(this, arguments);
      }

      Task.prototype.idAttribute = "_id";

      Task.prototype.collection = Tasks;

      Task.prototype.url = function() {
        console.log(this.get('_id'));
        if (this.get('_id')) {
          return '/tasks/' + this.get('_id') + '.json';
        } else {
          return '/tasks.json';
        }
      };

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
        this.render = __bind(this.render, this);
        return TaskListItemView.__super__.constructor.apply(this, arguments);
      }

      TaskListItemView.prototype.className = 'task';

      TaskListItemView.prototype.template = _.template($("#task_list_item_template").html());

      TaskListItemView.prototype.events = {
        "click": "open"
      };

      TaskListItemView.prototype.initialize = function() {
        this.model.on('change', this.render);
        return this.model.view = this;
      };

      TaskListItemView.prototype.render = function() {
        var difference, dueDate, today, unfinished;
        $(this.el).html(this.template({
          taskName: this.model.get('name') || "&nbsp;",
          badgeNum: this.model.get('actions').length ? (unfinished = this.model.get('actions').filter(function(todo) {
            return !todo.done;
          }), unfinished.length ? unfinished.length : "") : "",
          completenessMsg: !this.model.get('actions') || !this.model.get('actions').length ? "&nbsp;" : this.model.get('actions').length + " actions",
          dueMsg: this.model.get("dueDate") ? (dueDate = (new Date(this.model.get("dueDate"))).getTime(), today = (new Date()).setHours(0, 0, 0, 0), difference = dueDate - today, difference /= 1000 * 60 * 60 * 24, difference === 0 ? "due today" : difference === 1 ? "1 day left" : difference === -1 ? "1 day overdue" : difference > 1 ? difference + " days left" : difference < -1 ? difference + " days overdue" : void 0) : "",
          createdByName: this.model.get("createdBy") === $.cookie('user_id') ? "Me" : "Other"
        }));
        return this;
      };

      TaskListItemView.prototype.open = function() {
        $("#tasks .selected").removeClass('selected');
        this.$el.addClass('selected');
        return appStatus.set({
          "selectedTask": this.model
        });
      };

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
        tasks.on('add', this.addOne);
        tasks.on('reset', this.addAll);
        tasks.on('all', this.render);
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
    ActionItemContentView = (function(_super) {

      __extends(ActionItemContentView, _super);

      ActionItemContentView.name = 'ActionItemContentView';

      function ActionItemContentView() {
        this.toggleDone = __bind(this.toggleDone, this);

        this.render = __bind(this.render, this);
        return ActionItemContentView.__super__.constructor.apply(this, arguments);
      }

      ActionItemContentView.prototype.className = "action";

      ActionItemContentView.prototype.template = _.template($("#action_item_content_template").html());

      ActionItemContentView.prototype.events = {
        "click .checkbox": "toggleDone"
      };

      ActionItemContentView.prototype.initialize = function() {};

      ActionItemContentView.prototype.render = function() {
        if (this.model.done) {
          $(this.el).addClass("completed");
        }
        $(this.el).html(this.template({
          actionName: this.model.name
        }));
        return this;
      };

      ActionItemContentView.prototype.toggleDone = function() {
        $(this.el).toggleClass("completed");
        this.model.done = !this.model.done;
        this.taskModel.save();
        return this.taskModel.trigger('change');
      };

      return ActionItemContentView;

    })(Backbone.View);
    TaskContentView = (function(_super) {

      __extends(TaskContentView, _super);

      TaskContentView.name = 'TaskContentView';

      function TaskContentView() {
        this.render = __bind(this.render, this);
        return TaskContentView.__super__.constructor.apply(this, arguments);
      }

      TaskContentView.prototype.el = $('#TaskContentView');

      TaskContentView.prototype.controls_template = _.template($("#actions_controls_template").html());

      TaskContentView.prototype.initialize = function() {
        return appStatus.on('change:selectedTask', this.render);
      };

      TaskContentView.prototype.render = function() {
        var action, actions, itemView, _i, _len, _results;
        this.$("#actions_placeholder").remove();
        this.$("#actions_controls").remove();
        this.model = appStatus.get("selectedTask");
        this.$el.prepend(this.controls_template({
          createdByName: this.model.get("createdBy") === $.cookie('user_id') ? "Me" : "Other",
          createdOnDate: (new Date(this.model.get("createDate"))).toLocaleDateString()
        }));
        this.$("#actions").html("");
        actions = this.model.get("actions");
        if (!actions.length) {
          return this.$("#actions").html("This task has no actions.");
        } else {
          _results = [];
          for (_i = 0, _len = actions.length; _i < _len; _i++) {
            action = actions[_i];
            itemView = new ActionItemContentView({
              model: action
            });
            itemView.taskModel = this.model;
            itemView.Collection = actions;
            _results.push(this.$("#actions").append(itemView.render().el));
          }
          return _results;
        }
      };

      return TaskContentView;

    })(Backbone.View);
    window.taskContentView = new TaskContentView;
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
          $(topbarLink).removeClass('active');
          return _this.clearForm();
        });
      };

      CollapsibleView.prototype.close = function() {
        return $(this.el).collapse('hide');
      };

      CollapsibleView.prototype.clearForm = function() {
        return this.$(".controls input").val("");
      };

      return CollapsibleView;

    })(Backbone.View);
    createTaskView = new CollapsibleView({
      el: '#create_task'
    });
    findPeopleView = new CollapsibleView({
      el: '#find_people'
    });
    createTaskView.delegateEvents({
      "click input.foldup": "close",
      "submit #createTaskForm": function() {
        var action;
        tasks.create({
          name: this.$('input[name=name]').val() || "New Task",
          createdBy: $.cookie('user_id'),
          dueDate: this.$('input[name=dueDate]').val(),
          actions: (function() {
            var _i, _len, _ref, _results;
            _ref = this.$('#actions_input .action input');
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              action = _ref[_i];
              if ($(action).val()) {
                _results.push({
                  name: $(action).val()
                });
              }
            }
            return _results;
          }).call(this)
        });
        return this.close();
      }
    });
    ActionItemFormView = (function(_super) {

      __extends(ActionItemFormView, _super);

      ActionItemFormView.name = 'ActionItemFormView';

      function ActionItemFormView() {
        this.add = __bind(this.add, this);

        this.render = __bind(this.render, this);
        return ActionItemFormView.__super__.constructor.apply(this, arguments);
      }

      ActionItemFormView.prototype.className = "action";

      ActionItemFormView.prototype.template = _.template($("#action_item_form_template").html());

      ActionItemFormView.prototype.render = function() {
        $(this.el).html(this.template);
        return this;
      };

      ActionItemFormView.prototype.events = {
        "click i.remove": "remove",
        "click i.add": "add"
      };

      ActionItemFormView.prototype.add = function() {
        return actionsFormView.addOne(this);
      };

      return ActionItemFormView;

    })(Backbone.View);
    ActionsFormView = (function(_super) {

      __extends(ActionsFormView, _super);

      ActionsFormView.name = 'ActionsFormView';

      function ActionsFormView() {
        this.addOne = __bind(this.addOne, this);
        return ActionsFormView.__super__.constructor.apply(this, arguments);
      }

      ActionsFormView.prototype.el = $('#actions_input');

      ActionsFormView.prototype.initialize = function() {
        var itemView;
        itemView = new ActionItemFormView;
        return this.$(".controls").prepend(itemView.render().el);
      };

      ActionsFormView.prototype.addOne = function(current_item) {
        var itemView;
        itemView = new ActionItemFormView;
        return current_item.$el.after(itemView.render().el);
      };

      return ActionsFormView;

    })(Backbone.View);
    return actionsFormView = new ActionsFormView;
  });

}).call(this);
