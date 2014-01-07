define "utilities", ["jquery", "underscore"], ->
	if typeof Object.create isnt "function"
	  Object.create = (o) ->
	    F = ->
	    F:: = o
	    new F()

	return {
		# Quick logger, saves keystrokes
		c: () -> for arg in arguments then console.log arg
		create: Object.create
		# Bind multiple events to an object at once.... this is probably native and I'm missing it.
		addEventListeners: (obj, events) -> _.each events, (fn, name) -> obj.addEventListener name, fn
	}
