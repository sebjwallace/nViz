
function EventsHandler(){

  this.events = {}
  this.subscriptions = {}

}

EventsHandler.prototype.addEvent = function(id,fn){

  if(!this.events[id])
    this.events[id] = []
  this.events[id].push(fn)

}

EventsHandler.prototype.removeEvent = function(id){

  if(this.events[id])
    delete this.events[id]

}

EventsHandler.prototype.clearEvent = function(id){

  this.events[id] = []

}

EventsHandler.prototype.triggerEvent = function(id,e){

  for(var i = 0; i < this.events[id].length; i++)
    this.events[id][i](e)

}
