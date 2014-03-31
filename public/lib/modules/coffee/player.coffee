define "player", ["utilities", "npc", "board", "globals", "mapper", "items", "backbone", "easel", "underscore"], (ut, NPC, board, globals, mapper, items) ->
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
			_.bindAll @, "contextualize", "insideChunkBounds", "move", "defaults"
			_.bind @move_callbacks.done, @
			_.bind @move_callbacks.change, @
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
		move_callbacks:
			done: (dx, dy) ->
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
				@marker.x %= globals.map.width
				@marker.y %= globals.map.height
				@set "current_chunk", chunk
				@trigger "change:current_chunk"
				board.addMarker @
				{ x: x, y: y }
			change: (dx, dy)->
				# console.log "change :)"
		move: (dx, dy) ->
			# board.addState("battle").removeState("travel")
			# Call super move function then do native bound checking when animation done
			super(dx, dy)
		defaults: ->
			defaults = super
			Item = items.Item
			inventory = defaults.inventory
			inventory.add new Item name: 'Wooden Sword'
			inventory.add new Item name: "Tattered Cloak"
			inventory.add new Item name: "Bread"
			inventory.add new Item name: "Worn Boots"
			inventory.at(2).set("equipped", true)
			_.each inventory.models, (item) => item.set("belongsTo", @)
			inventory.sort()
			return _.extend defaults, {
				current_chunk: { x: 0, y: 0 }
				inventory: inventory
				type: "PC"
				name: "Hero"
				attrs:
					spd: 6
					ac: 10
					jmp: 2
					atk: 3
			}


	return {
		model: player
		PC: new player()
	}