define ["utilities", "board", "underscore", "backbone"], (ut, board) ->
	ut.c board

	# Converts left/right/up/down to x y
	coordToDir = (coord, orientation) ->
		orientation || orientation = "1"
		orientation = orientation.toString()
		{"-1x": "left", "1x": "right", "-1y": "up", "1y": "down"}[orientation + coord]

	move_fns = {
		movingIntervals: {}
		secondarymove: null
		walkSpeed: 20
		walkopts: {
			framerate: 30
			animations: 
				run: [0,3]
			images: ["images/sprites/hero.png"]
		}
		moveMarker: (marker, dir, offset) ->
			marker[dir] += 5*(offset || 1)
		stopWhenMoved: (count, dir) -> 
			if count >= 9
				clearInterval @movingIntervals[dir]
				# @moving[dir] = false
				count + 1
			else count + 1
		moveright: (marker, dir) ->
			count = 0
			unless marker.x >= 650
				@movingIntervals[dir] = setInterval =>
					@moveMarker(marker, dir)
					count = @stopWhenMoved(count, dir)
				, @walkSpeed
				return "right"
			false
		moveleft: (marker, dir) ->
			count = 0
			unless marker.x <= 0
				@movingIntervals[dir] = setInterval =>
					@moveMarker(marker, dir, -1)
					count = @stopWhenMoved(count, dir)
				, @walkSpeed
				return "left"
			false
		moveup: (marker, dir) ->
			count = 0
			unless marker.y <= 0
				@movingIntervals[dir] = setInterval =>
					@moveMarker(marker, dir, -1)
					count = @stopWhenMoved(count, dir)
				, @walkSpeed
				return "up"
			false
		movedown: (marker, dir) ->
			count = 0
			unless marker.y >= 650
				@movingIntervals[dir] = setInterval =>
					@moveMarker(marker, dir)
					count = @stopWhenMoved(count, dir)
				, @walkSpeed
				return "down"
			false
	}

	NPC = Backbone.Model.extend
		# moving: {
		# 	x: false
		# 	y: false
		# }
		# expects x and inverse-y deltas, IE move(0, 1) would be a downward move by 1 "square"
		move: (x, y) ->
			if !@stage or !@marker then return @
			board.moveObjectTo @, @marker.x + x, @marker.y + y,
				done: =>
					if sheet
						# @moving[coord] = true
						sheet = @marker.spriteSheet = @sheets[sheet]
						# Normalize
						sheet.getAnimation("run").speed = .13
						sheet.getAnimation("run").next = "run"
			@
		defaults: ->
			name: "NPC"
			items: []
			sprite: null
		frames: {left: null, right: null, up: null, down: null}
		getPrivate: (id) ->
			move_fns[id]

	# Bind all the private functions to the public object.... invisibly 0_0
	_.each move_fns, (fn) ->
		if typeof fn == "function" then _.bind fn, NPC

	NPC