# The beginning of the game! Woot! This module sets up the story and gets the play up and running.
define ["utilities", "board", "dialog", "globals", "taskrunner", "mapper", "traveler", "underscore", "jquery"], (ut, board, dialog, globals, runner, mapper, traveler) ->

	stage = board.getStage()

	g = []
	for i in [0..10] then g.push "g"

	mapObj = [
		["g", "gwbr", "w", "gwtl", g]
		["gwbr", "w", "gwtl", "g",g]
		["w", "gwtl", "g", g]
		["w", "gwbl", "g", g]
		["gwtr", "w", "gwbl", g]
		["g", "gwtr", "gwtl",g ]
	]

	return {
		initialize: ->
			board.clear()
			dialog.initialize()
			dialog.loadDialogSet([
				# {
				# 	text: ""
				# 	options: delay: 3000
				# }
				# {
				# 	text: ->
				# 		str  = 'I did not come to this land on purpose. I grew up far from here, in a land of beauty.'
				# 		str += 'This place is a shadow of my homeland. We are told to live in the moment, or to look to the future, but '
				# 		str += 'as I lay dying, there is no future, and the present does not bear thinking about. The past is all that is left...'
				# 	options:
				# 		delay: 12000
				# 		before: ->
				# 			# board.setKeysDisabled true
				# 		# If we don't want text to draw
				# 		# instant: true
				# 		# If we do, choose the speed in ms per word... larger is slower writing
				# 		speed: 135
				# 	}
				# {
				# 	text: "When was the last time I saw a demon or a demigod? I can’t remember. My memories are crumbling like old paper."
				# 	options: 
				# 		delay: 8000
				# }
				{
					text: 'Perhaps I should show them to you, before they are gone forever. Someone needs to understand. Someone needs to see my homeland...'
					options:
						delay: 5000
						speed: 12
						after: ->
							board.setPresetBackground ""
							dialog.destroy()
							mapper.renderMap mapper.loadMap(mapObj), stage
							board.addState("TRAVEL").removeState "WAITING"
							# board.setKeysDisabled false
							# board.setState globals.states.WAITING

				}
			])
		
	}