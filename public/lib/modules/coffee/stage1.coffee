# The beginning of the game! Woot! This module sets up the story and gets the play up and running.
define ["mapcreator", "utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], (mapcreator, ut, board, dialog, globals, runner, player, mapper, controls) ->
	# Expose shared events
	_events = _.extend {}, Backbone.Events
	# Store map triggers for this map in an object
	_triggers = {
		"test": -> alert("you triggered my trap")
	}
	PC = player.PC
	stage = board.getStage()
	# This is the bare array of map identifiers, elevation, enterable, trigger IDs, etc
	_stageObj = {}
	# This is the parsed map with bitmaps - has not been added to the 
	# stage at all after loading, only created
	_bitmap = []

	generateChunkSprite = (chunk, j, i) ->
		if chunk.background_position is true
			str = "-"  + globals.map.width*i  + "px "
			str += "-" + globals.map.height*j + "px"
			str
		else chunk.background_position

	_initialize = ->
		board.clear()
		clearInterval globals.introScenery
		# introSlider 3
		dialog.initialize()
		dialog.loadDialogSet([
			# {
			# 	text: ""
			# 	options: delay: 3000
			# }
			# {
			# 	text: ->
			# 		str  = 'My coming was an accident. I grew up far from here, in a land of beauty. '
			# 		str += 'This place is a shadow of my homeland. '
			# 		str += 'As I lay here dying, there is no future, and the present does not bear thinking about. The past is all that is left...'
			# 	options:
			# 		delay: 12000
			# 		before: ->
			# 			# board.setKeysDisabled true
			# 		# If we don't want text to draw
			# 		# instant: true
			# 		# If we do, choose the speed in ms per word... larger is slower writing
			# 		speed: 135
			# 	}
			{
				# text: 'My memories are crumbling like old paper. Perhaps I should show them to you, before they are gone forever. Someone needs to understand. Someone needs to see my homeland...'
				text: " YOLO "
				options:
					delay: 1000
					speed: 82
					after: ->
						PC.trigger("change:current_chunk")
						c = PC.get("current_chunk")
						board.setPresetBackground ""
						dialog.destroy()
						board.addMarker PC
						mapper.renderChunk _bitmap[c.y][c.x], stage
						board.addState("TRAVEL").removeState("WAITING")
						board.setMapSize(_stageObj.width*globals.map.width, _stageObj.height*globals.map.height)
						PC.marker.y = 500

			}
		])
	# t = ut.tileEntryCheckers
	$.getJSON "lib/json_packs/stage1.json", (json) =>
		_stageObj = json
		for f in [0..._stageObj.height]
			_bitmap[f] = []
		map = _stageObj.map
		# Take each chunk defined above (will move to JSON map files) and load it into a full array of bitmaps
		for i in [0..._stageObj.width] then for j in [0..._stageObj.height]
			chunk = map[j][i]
			chunk.background_position = generateChunkSprite chunk, j, i
			if !chunk.tiles 
				chunk.tiles = mapcreator.getDefaultChunk()
			else 
				_.each chunk.tiles, (row) ->
					_.each row, (tile) ->
						if tile.trigger 
							tile.trigger = _triggers[tile.trigger]
			_bitmap[j][i] = mapper.loadChunk(chunk, j, i)
			_bitmap[j][i].background_position = chunk.background_position
		_events.trigger "doneloading"
			# mapcreator.loadChunk map[j][i].tiles


	return {
		getBackground: ->
			_stageObj.background
		getBitmap: -> _bitmap
		getPrecursor: -> _stageObj.map
		initialize: _initialize
		events: _events
		
	}