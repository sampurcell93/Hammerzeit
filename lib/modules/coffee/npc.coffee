define ["utilities", "board", "mapper", "underscore", "backbone"], (ut, board, mapper) ->
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
		# Pass in the move deltas, and the NPC will use the current 
		# active chunk to determine if the spot is enterable.
		checkEnterable: (dx, dy)->
			chunk = mapper.getVisibleChunk().children
			try 
				tile = chunk[(@marker.y+(50*dy))/50]?.children[(@marker.x+(50*dx))/50]
				ut.c tile
				if tile.enter is false then return false else return true
			catch
				return false
		# expects x and inverse-y deltas, IE move(0, 1) would be a downward move by 1 "square"
		# Returns false if the move will not work, or returns the new coords if it does.
		move: (dx, dy) ->
			marker = @marker
			prev = {x: marker.x, y: marker.y}
			if !@stage or !marker then return false
			# Turn sprite regardless of success
			sheet = marker.spriteSheet = @sheets[dx+","+dy]
			if !@checkEnterable(dx, dy) then return false
			marker.x += (50*dx)
			marker.y += (50*dy)
			sheet.getAnimation("run").speed = .13
			sheet.getAnimation("run").next = "run"
			{x: marker.x, y: marker.y}
		defaults: ->
			name: "NPC"
			items: []
			sprite: null
		getPrivate: (id) ->
			privates[id]

	# Bind all the private functions to the public object.... invisibly 0_0
	# _.each move_fns, (fn) ->
		# if typeof fn == "function" then _.bind fn, NPC

	NPC