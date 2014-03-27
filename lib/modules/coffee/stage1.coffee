# The beginning of the game! Woot! This module sets up the story and gets the play up and running.
define ["mapcreator", "utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], (mapcreator, ut, board, dialog, globals, runner, player, mapper, controls) ->
	PC = player.PC
	stage = board.getStage()
	# This is the bare array of map identifiers, elevation, enterable, triggers, etc
	_stageObj = {}
	# This is the parsed map with bitmaps - has not been added to the 
	# stage at all after loading, only created
	fullMap = []
	for i in [0..1]
		fullMap[i] = []

	# t = ut.tileEntryCheckers
	$.getJSON "lib/json_packs/stage1.json", (json) =>
		_stageObj = json
		map = _stageObj.map
		# Take each chunk defined above (will move to JSON map files) and load it into a full array of bitmaps
		for i in [0..._stageObj.width] then for j in [0..._stageObj.height]
			fullMap[j][i] = mapper.loadChunk(map[j][i])
			# mapcreator.loadChunk map[j][i].tiles


	return {
		fullMap: fullMap
		getMap: -> _stageObj.map
		initialize: ->
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
							board.setPresetBackground ""
							dialog.destroy()
							mapper.renderChunk fullMap[0][0], stage
							board.addState("TRAVEL").removeState("WAITING")
							board.addMarker PC
							PC.trigger("change:current_chunk")
							PC.marker.y = 400

				}
			])
		
	}