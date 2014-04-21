define ["utilities", "npc", "board", "globals", "mapper", "items", "powers", "backbone", "easel", "underscore"], (ut, NPC, board, globals, mapper, items, powers) ->

	stage = board.getStage()
	class player extends NPC.NPC
		type: 'player'
		initialize: (attrs) ->
			super
			_.bindAll @, "contextualize", "insideChunkBounds", "move", "defaults"
		isPC: -> true
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
				len = stage.children.length
				stage.setChildIndex marker, 0
				{ x: x, y: y }
			change: (dx, dy)->
				# console.log "change :)"
		initTurn: ->
			super
			globals.shared_events.trigger "openmenu"
		defaults: ->
			defaults = super
			inventory = defaults.inventory
			_.each inventory.models, (item) => item.set("belongsTo", @)
			inventory.sort()
			return _.extend defaults, {
				current_chunk: { x: 1, y: 1 }
				inventory: inventory
				type: "PC"
				name: "Hero"
				spd: 10
				AC: 10
				jmp: 2
				atk: 3
			}
		dispatch: ->
			globals.shared_events.trigger "bindmenu", @
			super

	PCs = new NPC.NPCArray
	PCs.add new player({path: "Dragoon"})

	return {
		model: player
		PC: PCs.at(0)
		PCs: PCs
	}