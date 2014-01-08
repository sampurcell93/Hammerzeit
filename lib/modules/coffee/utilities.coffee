define  ["jquery", "underscore"], ->
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
		underline: (ctx, text, x, y, size, color, thickness, offset) ->
		  width = ctx.measureText(text).width
		  switch ctx.textAlign
		    when "center"
		      x -= (width / 2)
		    when "right"
		      x -= width
		  y += size + (offset || 1)
		  ctx.beginPath()
		  ctx.strokeStyle = color || "#fff"
		  ctx.lineWidth = thickness || 2
		  ctx.moveTo x, y
		  ctx.lineTo x + width, y
		  ctx.stroke()
	}
