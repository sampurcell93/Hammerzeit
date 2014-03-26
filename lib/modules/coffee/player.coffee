define "player", ["utilities", "npc", "board", "globals", "mapper", "backbone", "easel", "underscore"], (ut, NPC, board, globals, mapper) ->
	class player extends NPC
		frames: {
			# The in place animation frames for the PC
			down: [[0, 0, 55, 55, 0]
					[55, 0, 55, 55, 0]
					[110, 0, 55, 55, 0]
					[165, 0, 55, 55, 0]]
			left: [[0, 55, 55, 55, 0]
				[55, 55, 55, 55, 0]
				[110, 55, 55, 55, 0]
				[165, 55, 55, 55, 0]]
			right: [[0, 110, 55, 55, 0]
				[55, 110, 55, 55, 0]
				[110, 110, 55, 55, 0]
				[165, 110, 55, 55, 0]]
			up: [[0, 165, 55, 55, 0]
				[55, 165, 55, 55, 0]
				[110, 165, 55, 55, 0]
				[165, 165, 55, 55, 0]]
		}
		initialize: (attrs) ->
			@walkopts = _.extend @getPrivate("walkopts"), {images: ["images/sprites/hero.png"]}
			@sheets = {
				"-1,0" : new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.left})
				"1,0": new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.right})
				"0,-1": new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.up})
				"0,1" : new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.down})
			}
			sheet = @sheets["0,1"]
			sheet.getAnimation("run").speed = .13
			sheet.getAnimation("run").next = "run"
			sprite = new createjs.Sprite(sheet, "run")
			@marker = sprite
			@marker.name = "Player"
		# Expects x, y object which normalizes negative values to board dimensions. So x=-50 beomes x=650
		contextualize: (coords) ->
			if coords.x < 0 then coords.x = globals.map.width + coords.x
			if coords.y < 0 then coords.y = globals.map.height + coords.y
		# Expects x, y deltas, and the previous coords
		insideChunkBounds: (chunk) ->	
			ut.c "before check:", chunk
			flag = false
			if chunk.x < 0
				chunk.x = 0
				# @marker.x += 50
				flag = true
			if chunk.y < 0
			 	chunk.y = 0
			 	# @marker.y += 50
			 	flag = true
			 ut.c "after: ",  chunk
			 flag
		move: (dx, dy) ->
			# board.addState("battle").removeState("travel")
			# Call super move function then do native bound checking
			coords = super
			if coords is false then return false
			@contextualize coords
			ut.c "contextualized"
			ut.c coords
			@marker.x  = newx = coords.x
			@marker.y  = newy = coords.y
			chunk = @get "current_chunk"
			if dx > 0 and (newx % globals.map.width) is 0 then chunk.x += 1
			else if dx < 0 and newx != 0 and (newx % globals.map.c_width) is 0 then chunk.x -= 1
			else if dy > 0 and (newy % globals.map.height) is 0 then chunk.y += 1
			else if dy < 0 and newy != 0 and (newy % globals.map.c_height) is 0 then chunk.y -= 1
			else return coords
			# if @insideChunkBounds(chunk)
			@marker.x %= globals.map.width
			@marker.y %= globals.map.height
			@set "current_chunk", chunk
			@trigger "change:current_chunk"
			board.addMarker @
			{ x: @marker.x, y: @marker.y }
		defaults:
			current_chunk: { x: 0, y: 0 }
			type: "PC"
			name: "Hero"
			inventory: ["Wooden Sword", "Tattered Cloak"]
			level: 1
			

	return {
		model: player
		PC: new player()
	}