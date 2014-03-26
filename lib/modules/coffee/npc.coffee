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
		defaults:
			current_chunk: { x: 0, y: 0 }
		# Note the argument order - reflects 2D array notation
		setChunk: (y,x) ->
			chunk = @get "current_chunk"
			chunk.x = x
			chunk.y = y
			@set "current_chunk", chunk
			@
		# Pass in the tile the NPC will move to - if the elevations are too different, return false
		checkElevation: (target) ->
			if Math.abs(@currentspace.elv - target.elv) >= 3 then false else true
		# Pass in the target tile and the move deltas, and the NPC will use the current 
		# active chunk to determine if the spot is enterable.
		checkEnterable: (target, dx, dy)->
			try 
				if @checkElevation(target) is false 
					ut.c "ELEVATION Incompatible"
					return false
				if target.e?
					if target.e is false or target.e == "f" then return false
					else if typeof target.e is "string"
						return _checkEntry[target.e](dx, dy)
					else return true
				else return true
			# If the indices do not exist, we're heading to a new chunk.
			catch 
				true
		getTargetTile: (dx, dy) ->
			chunk = mapper.getVisibleChunk().children
			chunk[(@marker.y+(50*dy))/50]?.children[(@marker.x+(50*dx))/50] || {}

		checkTrigger: (target) ->
			if typeof target.trigger is "function" 
				setTimeout target.trigger, 15
			else null

		canMoveOffChunk: (x, y) ->
			return !board.hasState("battle") and (x < globals.map.width or y < globals.map.height)

		# expects x and inverse-y deltas, IE move(0, 1) would be a downward move by 1 "square"
		# Returns false if the move will not work, or returns the new coords if it does.
		move: (dx, dy) ->
			marker = @marker
			target = @getTargetTile(dx,dy)
			prev = {x: marker.x, y: marker.y}
			if !@stage or !marker then return false
			# Turn sprite in new dir regardless of success
			sheet = marker.spriteSheet = @sheets[ut.floorToOne(dx)+","+ut.floorToOne(dy)]
			if !@checkEnterable(target, dx, dy) then return false
			dx *= 50
			dy *= 50
			if !@canMoveOffChunk(marker.x+dx, marker.y+dy) then return false
			marker.x += dx
			marker.y += dy
			@checkTrigger target
			@currentspace = target
			target.occupied = true
			target.occupiedBy = @marker
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

		getPrivate: (id) ->
			privates[id]

	# Bind all the private functions to the public object.... invisibly 0_0
	# _.each move_fns, (fn) ->
		# if typeof fn == "function" then _.bind fn, NPC

	NPC