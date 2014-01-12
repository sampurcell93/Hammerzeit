define "npc", ["utilities", "underscore", "backbone"], (ut) ->
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
			ut.c count, dir, @movingIntervals
			if count >= 9
				_.each @movingIntervals, (i, key) -> 
					clearInterval(i) unless dir != key
				@moving = false
				count + 1
			else count + 1

		# Converts left/right/up/down to x y
		dirToCoords: (dir) ->
			dirs = {"left": "x", "right": "x", "up": "y", "down": "Y"}
			dirs[dir]

		checkDiagonalMove: (marker, dir) ->
			secondarymove = @secondarymove
			if (dir == "x" and secondarymove == "y") or (dir == "y" and secondarymove == "x") 
					@secondarymove = null
					@["move" + dir](marker, @dirToCoords(dir))

		moveright: (marker, dir) ->
			count = 0
			unless marker.x >= 650
				@movingIntervals[dir] = setInterval =>
					@moveMarker(marker, dir)
					count = @stopWhenMoved(count, dir)
					@checkDiagonalMove(marker, dir)
				, @walkSpeed
				return "right"
			false
		moveleft: (marker, dir) ->
			count = 0
			unless marker.x <= 0
				@movingIntervals[dir] = setInterval =>
					@moveMarker(marker, dir, -1)
					count = @stopWhenMoved(count, dir)
					@checkDiagonalMove(marker, dir)
				, @walkSpeed
				return "left"
			false
		moveup: (marker, dir) ->
			count = 0
			unless marker.y <= 0
				@movingIntervals[dir] = setInterval =>
					@moveMarker(marker, dir, -1)
					count = @stopWhenMoved(count, dir)
					@checkDiagonalMove(marker, dir)
				, @walkSpeed
				return "up"
			false
		movedown: (marker, dir) ->
			count = 0
			unless marker.y >= 650
				@movingIntervals[dir] = setInterval =>
					@moveMarker(marker, dir)
					count = @stopWhenMoved(count, dir)
					@checkDiagonalMove(marker, dir)
				, @walkSpeed
				return "down"
			false
	}

	NPC = Backbone.Model.extend
		move: (dir) ->
			if !@stage or !@marker then return @
			if @moving then move_fns['secondarymove'] = dir
			fulldir = "move" + dir
			coords = { left: "x", right: "x", up: "y", down: "y"}
			# Private.... slow maybe. Definitely. Optimize.
			@sheet = sheet = move_fns[fulldir](@marker, coords[dir])
			if sheet
				@moving = true
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