define  ["jquery", "underscore"], ->

	_c = -> for arg in arguments then console.log arg

	clone = (orig) -> $.map(orig, (obj) -> $.extend true, {}, obj)

	$(document).on("mouseover", "[data-tooltip]", ->
			$t = $ @
			$t.data("mousedover", true)
			setTimeout =>
				if $t.data("mousedover") is true
					$t.addClass "show-tooltip"
			, 300
	)
	$(document).on("mouseout", "[data-tooltip]", ->
		$t = $ @
		$t.data("mousedover", false)
		$t.removeClass "show-tooltip"
	)

	String.prototype.capitalize = ->
		@charAt(0).toUpperCase() + @slice 1


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
		defaults = 
		    close: true
		    destroyHash: false
		    destroyOthers: true
		    className: ""
		    closeIn: null
		    isolate: false
		options = $.extend defaults, options
		unless options.destroyOthers is false
			destroyModal()
		modal = $("<div />").addClass("modal")
		try
		    if $.isArray(content)
		      $.each content, (index, item) ->
		          modal.append(item)
		    else modal.html(content)
		unless options.close is false
		    modal.prepend("<i class='close-modal icon-cross'></i>")
		    modal.find(".close-modal").on "click", ->
		        destroyModal(modal, options)
		    modal.on("keydown keyup", (e) ->
		    	key = e.keyCode || e.which
		    	if key == 27 then destroyModal(modal)
		    )
		if options.closeIn
			setTimeout =>
				destroyModal()
			, options.closeIn
		$(document.body).addClass("active-modal").append(modal)
		if options.isolate is true 
			$(".modal-background").fadeIn("fast")
		modal.addClass(options.className).attr("tabindex",0).fadeIn("fast").focus()
		modal

	destroyModal = (existing=$(".modal"), options) ->
		options = $.extend {destroyHash: false}, options
		existing.fadeOut("fast", -> 
			$(@).remove()
			$(".modal-background").fadeOut("fast")
		)
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

	return window.ut =  {
		# Quick logger, saves keystrokes
		c: -> _c.call(_c, arguments)
		# Bind multiple events to an object at once.... this is probably native and I'm missing it.
		addEventListeners: (obj, events) -> 
			_.each events, (fn, name) -> 
				obj.addEventListener name, fn
				_.bind fn, obj
		# Canvas contains no easy function for underlining text.
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
	    # Boolean functions which determine from which directions a tile may be entered.
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
			e: -> true
		}
		# Rounds to the closest one, either negative or positive
		floorToOne: (val) ->
			if val < 0 then -1 else if val > 0 then 1 else 0
		# Checks if an input has changed from the time it was instantiated.
		$inputChanged: $.fn.inputChanged
		# Quick ref for the slice function. Need more checking tho
		slice: Array.prototype.slice
		parseBool: (str) ->
			str = str.toLowerCase()
			if str is "true" then true 
			else if str is "false" then false
			else str
		# Shuffles an array! O(n)
		array_shuffle: (o) ->
			j = undefined
			x = undefined
			i = o.length

			while i
				j = Math.floor(Math.random() * i)
				x = o[--i]
				o[i] = o[j]
				o[j] = x
			o
		deep_clone: (orig) -> clone orig
		# Freezes an object and all objects it contains.
		deep_freeze: (o) ->
			prop = undefined
			propKey = undefined
			Object.freeze o # First freeze the object.
			for propKey of o
				prop = o[propKey]
			# If the object is on the prototype, not an object, or is already frozen, 
			# skip it. Note that this might leave an unfrozen reference somewhere in the
			# object if there is an already frozen object containing an unfrozen object.
				continue if not o.hasOwnProperty(propKey) or (typeof prop isnt "object") or Object.isFrozen(prop)
				deepFreeze prop # Recursively call deepFreeze.
			return
		# Rolls a dice with sides sides, and add a modifier to it
		# Return value WILL be a non-negative integer.
		roll: (sides=20, num=1, modifier=0) -> 
			for i in [0...num]
				modifier += Math.ceil(Math.random()*sides)
			if modifier < 0 then 0 else modifier

	}
