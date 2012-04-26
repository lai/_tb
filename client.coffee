$ ->
  
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  }  
  
  class Task extends Backbone.Model
    
    idAttribute: "_id"
    collection: Tasks
    
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
      @model.bind 'change', @render
      @model.view = @
      
    render: =>
      $(@el).html @template({
          #@model.toJSON()
          taskName: @model.get('name') || "&nbsp;"
        , badgeNum: ""
        , completenessMsg: "&nbsp;"
        , dueMsg: ""
        , createdByName: if (@model.get("createdBy") == $.cookie('user_id')) then "Me" else "Other"
      }) 
      @
      
    open: =>
      
    remove: ->
      $(@el).remove()
  
    clear: ->
      @model.clear()
      
  
  class TaskListView extends Backbone.View
    
    el: $ '#tasks'
    
    initialize: ->
      tasks.bind 'add', @addOne
      tasks.bind 'reset', @addAll
      tasks.bind 'all', @render
      tasks.fetch()
      
    render: =>
      
    addOne: (t) =>
      itemView = new TaskListItemView model: t
      $(@el).append itemView.render().el
      
    addAll: =>
      tasks.each @addOne
      
  taskListView = new TaskListView
  
  class CollapsibleView extends Backbone.View
    
    events:
      "click input.foldup": "close"    
    
    initialize: ->
      topbarLink = "#" + @el.id + "_link";
      $(@el).on 'show', =>
        $(topbarLink).addClass 'active'
      $(@el).on 'hide', =>
        $(topbarLink).removeClass 'active'

    close: ->
      $(@el).collapse('hide')
  
  
  createTaskView = new CollapsibleView el: '#create_task'
  findPeopleView = new CollapsibleView el: '#find_people'
  
  createTaskView.delegateEvents({
      "submit #createTaskForm": =>
        console.log("delegated")
  });
  

