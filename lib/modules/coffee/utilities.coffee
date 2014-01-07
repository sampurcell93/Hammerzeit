define "utilities", ["jquery", "underscore"], ->
	if typeof Object.create isnt "function"
	  Object.create = (o) ->
	    F = ->
	    F:: = o
	    new F()

	return {
		c: () -> for arg in arguments then console.log arg
		create: Object.create
	}
