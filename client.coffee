$ ->
  
  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  }  
  
  class Task extends Backbone.Model
    idAttribute: "_id"
    
    defaults:
      name: "New Task Name"
  
  class ListView extends Backbone.View
    
    el: $ 'body'
    
  
  
  collapse1 = $("#create_task")
  collapse1_link = $("#create_task_link")
  collapse2 = $("#find_people")
  collapse2_link = $("#find_people_link")
  
  $(collapse1.find("input.foldup")[0]).on 'click', (event) =>
    collapse1.collapse('hide')

  $(collapse2.find("input.foldup")[0]).on 'click', (event) =>
    collapse2.collapse('hide')
    
  collapse1.on 'show', =>
    collapse1_link.addClass("active")
    
  collapse1.on 'hide', =>
    collapse1_link.removeClass("active")
    
  collapse2.on 'show', =>
    collapse2_link.addClass("active")
    
  collapse2.on 'hide', =>
    collapse2_link.removeClass("active")
