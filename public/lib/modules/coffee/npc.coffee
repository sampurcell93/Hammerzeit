define ["globals", "utilities", "board", "mapper", "underscore", "backbone"], (globals, ut, board, mapper) ->
	_checkEntry = ut.tileEntryCheckers

	# Converts left/right/up/down to x y
	coordToDir = (coord, orientation) ->
		orientation || orientation = "1"
		orientation = orientation.toString()
		{"-1x": "left", "1x": "right", "-1y": "up", "1y": "down"}[orientation + coord]

	_p = {
		 walkopts: {
            framerate: 30
            animations: 
                run: [0,3]
            images: ["images/sprites/hero.png"]
        }
        walkspeed: 9
	}	
	
	_ts = globals.map.tileside

	class NPC extends Backbone.Model
		currentspace: {}
		move_callbacks: 
			done: -> 
			change: ->
		moving: {x: false, y: false}
		# Note the argument order - reflects 2D array notation
		setChunk: (y,x) ->
			chunk = @get "current_chunk"
			chunk.x = x
			chunk.y = y
			@set "current_chunk", chunk, {silent: true}
			@trigger "change:current_chunk"
			@
		# Pass in the tile the NPC will move to - if the diff in elevations exceeds the jump
		# score of the NPC, it is unenterable.
		checkElevation: (target) -> 
			!(Math.abs(@currentspace.elv - target.elv) > @get("attrs").jmp)
		# Pass in the target tile and the move deltas, and the NPC will use the current 
		# active chunk to determine if the spot is enterable.
		checkEnterable: (target, dx, dy)->
			ut.c "checking enter at " + dx + "," + dy
			try 
				if !@checkElevation(target)
					ut.c "failed elevation check"
					ut.c target
					return false
				if target.e?
					if target.e is false or target.e is "f" then return false
					else if typeof target.e is "string"
						return _checkEntry[target.e](dx, dy)
					else true
				else true
			# If the indices do not exist, we're heading to a new chunk.
			catch 
				true
		# Given move deltas, retrieve the DisplayObject (bitmap) at that position in the current chunk
		getTargetTile: (dx, dy, prev) ->
			chunk = mapper.getVisibleChunk().children
			y = if prev then prev.y else @marker.y
			x = if prev then prev.x else @marker.x
			if prev then ut.c "checking new target at " + x + "," + y
			chunk[(y+(50*dy))/50]?.children[(x+(50*dx))/50] || {}

		# Takes in a tile DisplayObject (bitmap) and calls a trigger function if it exists
		# Triggers stored in the trigger module
		checkTrigger: (target) ->
			if target.trigger?
				setTimeout triggers[target.trigger], 15
			else null

		canMoveOffChunk: (x, y) ->
			return !board.hasState("battle") and (x < globals.map.width or y < globals.map.height)

		# Set the sprite sheet to the direction given by the x,y coords. 
		setSpriteSheet: (dx,dy) ->
			@marker.spriteSheet = @sheets[ut.floorToOne(dx)+","+ut.floorToOne(dy)]
		# The square that the NPC was previously in should be cleared when left
		# Should be called in conjunction with "entersquare"
		leaveSquare: ->
			@currentspace.occupied = false
			@currentspace.occupiedBy = null
			@
		# Pass in a tile DisplayObject, and link it to this NPC
		enterSquare: (target) ->
			@currentspace = target
			target.occupied = true
			target.occupiedBy = @marker
		# Wrapper functions for basic moves
		moveRight: -> @move 1, 0
		moveLeft: -> @move -1, 0
		moveUp: -> @move 0, -1
		moveDown: -> @move 0, 1
		# Reset an animation's properties
		reanimate: (animation, speed, next) ->
			sheet = @marker.spriteSheet
			sheet.getAnimation(animation || "run").speed = speed
			sheet.getAnimation(animation || "run").next = next
		# Takes in a half position (say x= 476, y= 450) and rounds to the nearest 50 (up or down deps on dx,dy)
		# Returns x,y obj
		roundToNearestTile: (x, y, dx, dy) ->
			{x: (Math.ceil(x/_ts)*_ts), y: (Math.ceil(y/_ts)*_ts) }
		# Accepts delta params and returns a string for direction. so (1,0) would return "x"
		deltaToString: (dx, dy) ->	
			if dx isnt 0 then "x" else if dy isnt 0 then "y" else ""
		# Takes in a dir string and returns the opposite
		oppositeDir: (dir) ->
			if dir is "x" then "y" else if dir is "y" then "x" else ""
		# expects x and inverse-y deltas, IE move(0, 1) would be a downward move by 1 "square"
		# Returns false if the move will not work, or returns the new coords if it does.
		move: (dx, dy) ->
			if board.getPaused() then return true
			cbs = @move_callbacks
			marker = @marker
			@previous_position = @roundToNearestTile marker.x, marker.y, dx, dy
			target = @getTargetTile dx, dy
			sheet = @setSpriteSheet dx, dy
			dir = @deltaToString dx, dy
			other_dir = @oppositeDir dir
			if @moving[dir] is true then return false
			ut.c "dir is " + dir
			ut.c "other dir is " + other_dir
			if !@stage or !marker
				throw new Error("There is no stage or marker assigned to this NPC!")
			count = 0
			ut.c "SETTING " + dir + " TO TRUE"
			@moving[dir] = true
			m_i = setInterval =>
				if count < 10
					marker.x += 5*dx
					marker.y += 5*dy
					cbs.change.call(@, dx, dy)
				else 
					clearInterval m_i
					@moving[dir] = false
					marker = _.extend(marker, @roundToNearestTile marker.x, marker.y, dx, dy)
					@checkTrigger target
					do @leaveSquare
					@enterSquare target
					@reanimate "run", .13, "run"
					cbs.done.call(@, dx, dy)
				count++
			, _p.walkspeed
			console.log @moving
			if @moving[other_dir] is true
				ut.c "checking new target based on previous position"
				if other_dir is "y" then @previous_position.y += _ts
				else if other_dir is "x" then @previous_position.x += _ts
				ut.c @previous_position
				target = @getTargetTile(dx,dy, @previous_position)
				ut.c "found at" + target.x + "," + target.y
			if !@checkEnterable(target, dx, dy)
				ut.c "encountered a bad move:"
				ut.c "previous_position: ", @previous_position
				ut.c "vector was (x,y): ", dx, dy
				clearInterval m_i
				_.extend marker, @previous_position
				return @moving[dir] = false
			else ut.c "enterable at" + target.x/50 + "," + target.y/50
			true
		defaults: ->
			name: "NPC"
			inventory: []
			type: 'NPC'
			sprite: null
			level: 1
			HP: 10
			attrs:
				spd: 6
				ac: 10
				jmp: 2
				atk: 3
			# powers: 
			current_chunk: { x: 0, y: 0 }

		getPrivate: (id) ->
			_p[id]

	# Bind all the private functions to the public object.... invisibly 0_0
	# _.each move_fns, (fn) ->
		# if typeof fn == "function" then _.bind fn, NPC

	window.NPC = NPC