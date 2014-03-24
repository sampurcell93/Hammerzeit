define ["utilities", "board", "underscore", "backbone"], (ut, board) ->
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
		# expects x and inverse-y deltas, IE move(0, 1) would be a downward move by 1 "square"
		move: (x, y) ->
			if !@stage or !@marker then return @
			@marker.x += (50*x)
			@marker.y += (50*y)
			sheet = @marker.spriteSheet = @sheets[x+","+y]
			sheet.getAnimation("run").speed = .13
			sheet.getAnimation("run").next = "run"
			{x: @marker.x, y: @marker.y}

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