$ ->
  
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  }
  
  class AppStatus extends Backbone.Model
    
    defaults:
      selectedTask: null
      
  appStatus = new AppStatus
  
  class Task extends Backbone.Model
    
    idAttribute: "_id"
    collection: Tasks
    url: =>
      '/tasks/' + @.get('_id') + '.json'
    
    defaults:
      name: "New Task"
      done: false
      
    toggle: ->
      @save done: !@get("done")
      
    clear: ->
      @destory()
      @view.remove()
      
  class Tasks extends Backbone.Collection
    
    model: Task
    url: '/tasks.json'
    
    done: ->
      @filter (t) ->
        t.get('done')
        
    remaining: ->
      @without.apply(@, @done())
      
      
  tasks = new Tasks
    
    
  class TaskListItemView extends Backbone.View
    
    className: 'task'
      
    template: _.template($("#task_list_item_template").html())
    
    events:
      "click": "open"
      
    initialize: ->
      @model.on 'change', @render
      @model.view = @
      
    render: =>
      $(@el).html @template({
          #@model.toJSON()
          taskName: @model.get('name') || "&nbsp;"
        , badgeNum: ""
        , completenessMsg: # Right now just showing the total num of actions
            if (!@model.get('actions') || !@model.get('actions').length) # "" || 0
              "&nbsp;"
            else
              @model.get('actions').length + " actions"
        , dueMsg:
            if (@model.get("dueDate"))
              dueDate = (new Date(@model.get("dueDate"))).getTime()
              today = (new Date()).setHours(0, 0, 0, 0)
              difference = dueDate - today
              difference /= (1000*60*60*24)
              if (difference == 0)
                "due today"
              else if (difference == 1)
                "1 day left"
              else if (difference == -1)
                "1 day overdue"
              else if (difference > 1)
                difference + " days left"
              else if (difference < -1)
                difference + " days overdue"
            else
              ""
        , createdByName:
            if (@model.get("createdBy") == $.cookie('user_id')) then "Me" else "Other"
      }) 
      @
      
    open: ->
      $("#tasks .selected").removeClass('selected')
      @$el.addClass('selected')
      appStatus.set "selectedTask": @model
      
    remove: ->
      $(@el).remove()
  
    clear: ->
      @model.clear()
      
  
  class TaskListView extends Backbone.View
    
    el: $ '#tasks'
    
    initialize: ->
      tasks.on 'add', @addOne
      tasks.on 'reset', @addAll
      tasks.on 'all', @render
      tasks.fetch()
      
    render: =>
      
    addOne: (t) =>
      itemView = new TaskListItemView model: t
      $(@el).append itemView.render().el
      
    addAll: =>
      tasks.each @addOne
      
  taskListView = new TaskListView
  
  class ActionItemContentView extends Backbone.View
    
    className: "action"
    template: _.template($("#action_item_content_template").html())
          
    events:
      "click .checkbox": "toggleDone"
        
    initialize: ->
      #console.log @model.done
      #@className = "action completed" if @model.done
    
    render: =>
      #console.log @Collection
      $(@el).addClass("completed") if @model.done
      $(@el).html @template({
          actionName: @model.name
      })
      @
      
    toggleDone: =>
      console.log "toggle now!"
      $(@el).toggleClass("completed")
      @model.done = !@model.done
      @taskModel.save()
    
    
  class TaskContentView extends Backbone.View
    
    el: $ '#TaskContentView'
    
    controls_template: _.template($("#actions_controls_template").html())
    
    initialize: ->
      appStatus.on('change:selectedTask', @render)
      #@$el.append
      
    render: =>
      @$("#actions_placeholder").remove()
      @$("#actions_controls").remove()
      @model = appStatus.get "selectedTask"
      @$el.prepend @controls_template({
        createdByName: if (@model.get("createdBy") == $.cookie('user_id')) then "Me" else "Other"
        createdOnDate: (new Date(@model.get("createDate"))).toLocaleDateString()
      })
      
      @$("#actions").html ""
      actions = @model.get "actions"
      if (!actions.length)
        @$("#actions").html "This task has no actions."
      else
        for action in actions
          itemView = new ActionItemContentView model: action
          itemView.taskModel = @model
          itemView.Collection = actions
          @$("#actions").append itemView.render().el
      # @model is avaiable now
      #console.log(tasks.selectedTask)
      #console.log appStatus.get "selectedTask"
      
  window.taskContentView = new TaskContentView
  
  class CollapsibleView extends Backbone.View
    
    events:
      "click input.foldup": "close"    
    
    initialize: ->
      topbarLink = "#" + @el.id + "_link";
      $(@el).on 'show', =>
        $(topbarLink).addClass 'active'
      $(@el).on 'hide', =>
        $(topbarLink).removeClass 'active'
        @clearForm()

    close: ->
      $(@el).collapse('hide')      
      
    clearForm: ->
      @.$(".controls input").val("")
  
  
  createTaskView = new CollapsibleView el: '#create_task'
  findPeopleView = new CollapsibleView el: '#find_people'
  
  createTaskView.delegateEvents({
      "click input.foldup": "close"
      "submit #createTaskForm": ->
        # console.log("delegated")
        # console.log(@$('input[name=name]'))
        # console.log(@$('input[name=dueDate]'))
        # console.log(@$('#actions_input .action input'))
        tasks.create({
            name: @$('input[name=name]').val() || "New Task"
          , createdBy: $.cookie('user_id')
          , dueDate: @$('input[name=dueDate]').val()
          , actions:
              {name: $(action).val()} for action in @$('#actions_input .action input') when $(action).val() 
        })
        @close()
  });
  
  class ActionItemFormView extends Backbone.View
    
    className: "action"
    template: _.template($("#action_item_form_template").html())
    
    render: =>
      $(@el).html @template
      @
      
    events:
      "click i.remove": "remove"
      "click i.add": "add"
      
    add: =>
      actionsFormView.addOne(@)
    

  class ActionsFormView extends Backbone.View
    
    el: $ '#actions_input'
    # items: []
    
    initialize: ->
      itemView = new ActionItemFormView
      # @items.push(itemView)
      @$(".controls").prepend itemView.render().el
      
    addOne: (current_item) =>
      itemView = new ActionItemFormView      
      current_item.$el.after itemView.render().el
    

  actionsFormView = new ActionsFormView
