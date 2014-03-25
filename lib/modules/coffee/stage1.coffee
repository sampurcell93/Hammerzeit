# The beginning of the game! Woot! This module sets up the story and gets the play up and running.
define ["utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], (ut, board, dialog, globals, runner, player, mapper, controls) ->
	PC = player.PC
	stage = board.getStage()
	mapObj = []
	fullMap = []
	for i in [0..1]
		mapObj[i] = []
		fullMap[i] = []

	t = ut.tileEntryCheckers

	# The first chunk (think top left of total map)
	mapObj[0][0] = [[{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"trb"},{"t":"e","e":"tbl"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"}],[{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"f"},{"t":"e","e":"rb"},{"t":"e","e":"e"},{"t":"e","e":"tbl"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"}],[{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"}],[{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"}],[{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"}],[{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"}],[{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"}],[{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"}],[{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"}],[{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"}],[{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"}],[{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"}],[{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"}],[{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"},{"t":"e"}]]

	# Take each chunk defined above (will move to JSON map files) and load it into a full array of bitmaps
	for i in [0..0] then for j in [0..0]
		fullMap[i][j] = mapper.loadChunk(mapObj[i][j])

	return {
		fullMap: fullMap
		pictoMap: mapObj
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
							PC.marker.y = 500
							# PC.setChunk(1,0)
							board.setBackground("images/tiles/hometown.jpg")
				}
			])
		
	}