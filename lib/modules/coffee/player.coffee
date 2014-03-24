define "player", ["utilities", "npc", "board", "globals", "mapper", "backbone", "easel", "underscore"], (ut, NPC, board, globals, mapper) ->
	class player extends NPC
		defaults:
			current_chunk: { x: 0, y: 0 }
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
			if coords.y < 0 then coords.y = globals.map.width + coords.y
		move: (dx, dy) ->
			# board.addState("battle").removeState("travel")
			# Call super move function then do native bound checking
			coords = super
			if coords is false then return
			@contextualize coords
			@marker.x  = newx = coords.x
			@marker.y  = newy = coords.y
			chunk = @get "current_chunk"
			if dx > 0 and (newx % globals.map.width) is 0 then chunk.x += 1
			else if dx < 0 and (newx % globals.map.c_width) is 0 then chunk.x -= 1
			else if dy > 0 and (newy % globals.map.height) is 0 then chunk.y += 1
			else if dy < 0 and (newy % globals.map.c_height) is 0 then chunk.y -= 1
			else return coords
			@marker.x %= globals.map.width
			@marker.y %= globals.map.height
			@set "current_chunk", chunk
			@trigger "change:current_chunk"
			board.addMarker @
			{ x: @marker.x, y: @marker.y }

	return {
		model: player
		PC: new player({name: "Hero", items: ["Wooden Sword", "Tattered Cloak"]})
	}