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
			_.bindAll @, "contextualize", "afterMove", "insideChunkBounds", "move"
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
		# Expects x, y which normalizes negative values to board dimensions. So x=-50 beomes x=650
		contextualize: (x, y) ->
			if x < 0 then x += globals.map.width
			if y < 0 then y += globals.map.height
			{x:x, y:y}
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
			 flag
		afterMove: (dx, dy) ->
			chunk = @get "current_chunk"
			marker = @marker
			_.extend(marker, coords = @contextualize marker.x, marker.y)
			x = marker.x
			y = marker.y
			if dx > 0 and (x % globals.map.width) is 0 then chunk.x += 1
			else if dx < 0 and x != 0 and (x % globals.map.c_width) is 0 then chunk.x -= 1
			else if dy > 0 and (y % globals.map.height) is 0 then chunk.y += 1
			else if dy < 0 and y != 0 and (y % globals.map.c_height) is 0 then chunk.y -= 1
			else return {x: x, y: y}
			ut.c "before context"
			ut.c coords
			ut.c "after"
			ut.c coords
			# if @insideChunkBounds(chunk)
			@marker.x %= globals.map.width
			@marker.y %= globals.map.height
			@set "current_chunk", chunk
			@trigger "change:current_chunk"
			console.log marker.x, marker.y
			board.addMarker @
			{ x: x, y: y }
		move: (dx, dy) ->
			# board.addState("battle").removeState("travel")
			# Call super move function then do native bound checking when animation done
			super(dx, dy, @afterMove)
		defaults:
			current_chunk: { x: 0, y: 0 }
			type: "PC"
			name: "Hero"
			inventory: ["Wooden Sword", "Tattered Cloak"]
			level: 1
			attrs:
				jmp: 2

	return {
		model: player
		PC: new player()
	}