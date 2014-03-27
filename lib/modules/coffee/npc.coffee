define ["globals", "utilities", "board", "mapper", "underscore", "backbone"], (globals, ut, board, mapper) ->
	_checkEntry = ut.tileEntryCheckers

	# Converts left/right/up/down to x y
	coordToDir = (coord, orientation) ->
		orientation || orientation = "1"
		orientation = orientation.toString()
		{"-1x": "left", "1x": "right", "-1y": "up", "1y": "down"}[orientation + coord]

	privates = {
		 walkopts: {
            framerate: 30
            animations: 
                run: [0,3]
            images: ["images/sprites/hero.png"]
        }
	}	
	
	class NPC extends Backbone.Model
		currentspace: {}
		# Note the argument order - reflects 2D array notation
		setChunk: (y,x) ->
			chunk = @get "current_chunk"
			chunk.x = x
			chunk.y = y
			@set "current_chunk", chunk, {siltnt: true}
			@trigger "change:current_chunk"
			@
		# Pass in the tile the NPC will move to - if the diff in elevations exceeds the jump
		# score of the NPC, it is unenterable.
		checkElevation: (target) ->
			if Math.abs(@currentspace.elv - target.elv) > @get("attrs").jmp then false else true
		# Pass in the target tile and the move deltas, and the NPC will use the current 
		# active chunk to determine if the spot is enterable.
		checkEnterable: (target, dx, dy)->
			try 
				elevation = @checkElevation(target)
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
		getTargetTile: (dx, dy) ->
			chunk = mapper.getVisibleChunk().children
			chunk[(@marker.y+(50*dy))/50]?.children[(@marker.x+(50*dx))/50] || {}

		# Takes in a tile DisplayObject (bitmap) and calls a trigger function if it exists
		checkTrigger: (target) ->
			if typeof target.trigger is "function" 
				setTimeout target.trigger, 15
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
		# expects x and inverse-y deltas, IE move(0, 1) would be a downward move by 1 "square"
		# Returns false if the move will not work, or returns the new coords if it does.
		move: (dx, dy, done) ->
			marker = @marker
			target = @getTargetTile(dx,dy)
			prev = {x: marker.x, y: marker.y}
			if !@stage or !marker then return false
			# Turn sprite in new dir regardless of success
			sheet = @setSpriteSheet()
			if !@checkEnterable(target, dx, dy) then return false
			count = 0
			m_i = setInterval =>
				if count == 1 
					@moving = true
				else if count <= 10
					marker.x += 5*dx
					marker.y += 5*dy
				else 
					clearInterval m_i
					@moving = false
					if done? and typeof done is "function" then done(dx, dy)
				count++
			, 5
			console.log "checking canMoveOffChunk"
			# if !@canMoveOffChunk(marker.x+dx*globals.tileside, marker.y+dy*globals.tileside) then return false

			if !@canMoveOffChunk(marker.x+dx*50, marker.y+dy*50) then return false
			# marker.x += dx
			# marker.y += dy
			@checkTrigger target
			do @leaveSquare
			@enterSquare target
			sheet.getAnimation("run").speed = .13
			sheet.getAnimation("run").next = "run"
			{x: marker.x, y: marker.y}
		defaults: ->
			name: "NPC"
			inventory: []
			type: 'NPC'
			sprite: null
			level: 1
			attrs:
				spd: 6
				ac: 10
				jmp: 1
				atk: 3
			# powers: 
			current_chunk: { x: 0, y: 0 }

		getPrivate: (id) ->
			privates[id]

	# Bind all the private functions to the public object.... invisibly 0_0
	# _.each move_fns, (fn) ->
		# if typeof fn == "function" then _.bind fn, NPC

	NPC