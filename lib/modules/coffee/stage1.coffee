# The beginning of the game! Woot! This module sets up the story and gets the play up and running.
define ["utilities", "board", "dialog", "globals", "taskrunner", "mapper", "traveler", "npc", "player", "underscore", "jquery"], (ut, board, dialog, globals, runner, mapper, traveler, NPC, player) ->
	PC = player.PC
	stage = board.getStage()

	g = []
	r = []
	t = []
	ten = []
	for i in [0...14] 
		g.push "g"
		r.push "wh"
		ten.push "ten"
		t.push "t"

	window.mapObj = [
		[r,r,r,r,r,r,r,r,r,r,r,r,r,r]
		[g,g,g,g,g,g,g,g,g,g,g,g,g,g]
	]

	return {
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
						delay: 1000
						speed: 12
						after: ->
							board.setPresetBackground ""
							dialog.destroy()
							mapper.renderMap mapper.loadMap(mapObj), stage
							board.addState("TRAVEL").removeState("WAITING")
							board.addCharacter PC
				}
			])
		
	}