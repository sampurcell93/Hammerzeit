# The beginning of the game! Woot! This module sets up the story and gets the play up and running.
define ["utilities", "board", "dialog", "globals", "underscore", "jquery"], (ut, board, dialog, globals) ->
	return {
		initialize: ->
			board.clear()
			dialog.initialize()
			dialog.loadDialogSet([
				{
					text: ->
						str  = 'I did not come to this land on purpose. I grew up far from here, in a land of beauty and mystique.'
						str += 'This place is a shadow of my homeland. They always tell you to live in the moment, or to look to the future.'
						str += 'As I lay dying, there is no future, and the moment does not bear thought. The past is all that is left...'
						str
					delay: 12000
					options:
						before: ->
							board.setKeysDisabled true
						# If we don't want text to draw
						# instant: true
						# If we do, choose the speed in ms per word... larger is slower writing
						speed: 105
					}
				{
					text: "When was the last time I saw a demon or a demigod? I can’t remember. My memories are crumbling like old paper."
					delay: 8000
				}
				{
					text: 'Perhaps I should show you, before they are gone forever. Someone needs to understand.'
					options:
						after: ->
							board.setKeysDisabled false
							board.setState globals.states.WAITING
				}
			])
			# board.dialog.draw "When a breeze caresses the fading trees of this world, we know it to be nothing more than Mother Earth sighing. I always look around carefully when I hear the wind. I come from a place much different than this, and in my youth, the wind brought danger. My memories are crumbling like old paper, but I can still see many things… The lights, growing brighter; that gold dust, swirling on the eddies; hot blood, coursing through those young veins. Oh, oh. How I remember."
			# board.dialog.waitThen ->
			# 	board.dialog.clear()
			# 	board.dialog.draw("yolo")
			# , 20000, globals.states.DRAWING
			# ut.c "stage 1 though"
	}