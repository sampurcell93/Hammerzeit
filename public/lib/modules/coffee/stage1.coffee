# The beginning of the game! Woot! This module sets up the story and gets the play up and running.
define ["battler", "mapcreator", "utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], (battler, mapcreator, ut, board, dialog, globals, runner, player, mapper, controls) ->
	# Expose shared events
	_events = _.extend {}, Backbone.Events
	# Store map triggers for this map in an object
	_triggers = {
		"test": -> alert("you triggered my trap")
	}
	PC = taskrunner.getPC()
	stage = board.getStage()
	# This is the bare array of map identifiers, elevation, enterable, trigger IDs, etc
	_stageObj = {}
	# This is the parsed map with bitmaps - has not been added to the 
	# stage at all after loading, only created
	_bitmap = []
	_raw_map = null

	generateBackgroundPosition = (i, j) ->
		str = "-"  + globals.map.width*i  + "px "
		str += "-" + globals.map.height*j + "px"
		str

	initialize = ->
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
						PC.changeChunk()
						board.setPresetBackground ""
						dialog.destroy()
						board.addMarker PC
						board.addState("TRAVEL").removeState("WAITING")
						# battler.start()
						# PC.marker.x = 250
						# PC.marker.y = 300
						PC.enterSquare()


			}
		])
	# t = ut.tileEntryCheckers
	$.getJSON globals.stage_dir + "stage1.json", (json) =>
		_stageObj = json
		console.log _stageObj
		_raw_map = _stageObj.map
		height = _stageObj.height
		width = _stageObj.width
		_.each _raw_map, (chunk_row,i) ->
			_.each chunk_row, (chunk,j) ->
				if chunk.background_position is true
					chunk.background_position = generateBackgroundPosition j, i
					console.log chunk.background_position
				if _.isUndefined(chunk.tiles)
					chunk.tiles = mapper.getEmptyMap()
		# 		if i is 0 and j is 0
		# 			console.log mapper.mapFromPrecursor(chunk.tiles)
		_events.trigger "loading:done"
		initialize()

	return {
		getBackground: -> _stageObj.background
		# Returns the 2D array of tiles and other options
		getPrecursor: -> _stageObj.map
		events: _events
		
	}