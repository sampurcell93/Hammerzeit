define  ["jquery", "underscore"], ->

	_c = -> for arg in arguments then console.log arg

	# Thanks to stackoverflow user Will for this handy class splitter
	(($) ->
	  $.fn.classes = (callback) ->
	    classes = []
	    $.each this, (i, v) ->
	      splitClassName = v.className.split(/\s+/)
	      for j of splitClassName
	        className = splitClassName[j]
	        classes.push className  if -1 is classes.indexOf(className)
	      return

	    if "function" is typeof callback
	      for i of classes
	        callback classes[i]
	    classes

	  return
	) jQuery

	window.onbeforeunload = (event) ->
	  s = "You have unsaved changes. Really leave?"
	  event = event or window.event	  
	  # This is for IE
	  event.returnValue = s  if event
	  # This is for all other browsers
	  s

	 $.fn.inputChanged = ->
	 	_c "checking changed"
	 	_c @
	 	_c @attr("changed")
	 	@attr("changed") || false

	if typeof Object.create isnt "function"
	  Object.create = (o) ->
	    F = ->
	    F:: = o
	    new F()

	launchModal = (content, options) ->
		destroyModal true
		defaults = 
		    close: true
		    destroyHash: false
		options = $.extend defaults, options
		modal = $("<div />").addClass("modal")
		try
		    if $.isArray(content)
		      $.each content, (index, item) ->
		          modal.append(item)
		    else modal.html(content)
		unless options.close is false
		    modal.prepend("<i class='close-modal'>X</i>")
		    modal.find(".close-modal").on "click", ->
		        destroyModal(null, options)
		    modal.on("keyup", (e) ->
		    	key = e.keyCode || e.which
		    	if key == 27 then destroyModal()
		    )
		$(document.body).addClass("active-modal").append(modal)
		modal

	destroyModal = (existing, options) ->
		options = $.extend {destroyHash: false}, options
		$(".modal").remove()
			# unless existing == true
		$(document.body).removeClass("active-modal")
		$("#game-board").focus()
				# if options.destroyHash == true
					# window.location.hash = ""

	l = (x,y) -> x>0
	# Only from right
	r = (x,y) -> x<0
	# top
	t = (x,y) -> y>0
	# bottom
	b = (x,y) -> y<0
	# Enter from left or right
	rl = (x,y) -> l(x,y) or r(x,y)
	# Left or top 
	tl = (x,y) -> l(x,y) or t(x,y)
	# Left or bottom
	bl = (x,y) -> l(x,y) or b(x,y)
	# Left right top
	trl = (x,y) -> tr(x,y) or l(x,y)
	# TBL
	tbl = (x,y) -> bl(x,y) or t(x,y)
	# left top bottom
	rbl = (x,y) -> l(x,y) or rb(x,y)
	# Right or top
	tr = (x,y) -> r(x,y) or t(x,y)
	# right or bottom
	rb = (x,y) -> r(x,y) or b(x,y)
	# right top bottom
	trb = (x,y) -> tr(x,y) or b(x,y)
	# top or bottom
	tb = (x,y) -> b(x,y) or t(x,y)

	return {
		# Quick logger, saves keystrokes
		c: _c
		create: Object.create
		# Bind multiple events to an object at once.... this is probably native and I'm missing it.
		addEventListeners: (obj, events) -> 
			_.each events, (fn, name) -> 
				obj.addEventListener name, fn
				_.bind fn, obj
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
		# launch modals - dependent on jquery for arrays
	    # args: content for the modal, as an array of content
	    # rets the modal jquery obj
		launchModal:  (content, options) ->
	        launchModal content, options
	  	destroyModal: (existing, options) ->
	        destroyModal existing, options
	    tileEntryCheckers: {
			# Only entered from the left
			l: (x,y) -> x>0
			# Only from right
			r: (x,y) -> x<0
			# top
			t: (x,y) -> y>0
			# bottom
			b: (x,y) -> y<0
			# Enter from left or right
			rl: (x,y) -> l(x,y) or r(x,y)
			# Left or top 
			tl: (x,y) -> l(x,y) or t(x,y)
			# Left or bottom
			bl: (x,y) -> l(x,y) or b(x,y)
			# Left right top
			trl: (x,y) -> tr(x,y) or l(x,y)
			# TBL
			tbl: (x,y) -> bl(x,y) or t(x,y)
			# left top bottom
			rbl: (x,y) -> l(x,y) or rb(x,y)
			# Right or top
			tr: (x,y) -> r(x,y) or t(x,y)
			# right or bottom
			rb: (x,y) -> r(x,y) or b(x,y)
			# right top bottom
			trb: (x,y) -> tr(x,y) or b(x,y)
			# top or bottom
			tb: (x,y) -> b(x,y) or t(x,y)
		}
		floorToOne: (val) ->
			if val < 0 then -1 else if val > 0 then 1 else 0
		$inputChanged: $.fn.inputChanged
		slice: Array.prototype.slice
	}
