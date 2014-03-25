# The beginning of the game! Woot! This module sets up the story and gets the play up and running.
define ["utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], (ut, board, dialog, globals, runner, player, mapper, controls) ->
	PC = player.PC
	stage = board.getStage()
	mapObj = []
	fullMap = []
	for i in [0..1]
		mapObj[i] = []
		fullMap[i] = []

	# Only entered from the left
	l = (x,y) -> x>0
	# Only from right
	r = (x,y) -> x<0
	# top
	t = (x,y) -> y>0
	# bottom
	b = (x,y) -> y<0
	# Enter from left or right
	lr = (x,y) -> l(x,y) or r(x,y)
	# Left or top 
	lt = (x,y) -> l(x,y) or t(x,y)
	# Left or bottom
	lb = (x,y) -> l(x,y) or b(x,y)
	# Left right top
	lrt = (x,y) -> l(x,y) or r(x,y) or t(x,y)
	# left right bottom
	lrb = (x,y) -> l(x,y) or r(x,y) or b(x,y)
	# left top bottom
	ltb = (x,y) -> l(x,y) or b(x,y) or t(x,y)
	# Right or top
	rt = (x,y) -> r(x,y) or t(x,y)
	# right or bottom
	rb = (x,y) -> r(x,y) or b(x,y)
	# right top bottom
	rtb = (x,y) -> b(x,y) or r(x,y) or t(x,y)
	# top or bottom
	tb = (x,y) -> b(x,y) or t(x,y)




	# The first chunk (think top left of total map)
	mapObj[0][0] = [
		["p","p","p","p","p","p","p","p","p","p","p","p","p","p","e","e", "p", "p", "p", "p"]
		["p","p","p","p","p","p","p","p","p","p","p",	 "p",			"p",		{t: 'e', e: rb},"e","e","p","p","p","p"]
		["p","p","p","p","p","p","p","p","p","p","p",{t: "e", e: b},{t: 'e',e: rb}]
		["p","e","e","e","e","e","e","e","e","e","e",{t: 'e', e:lt},{t: 'e',e: rtb}]
		["e","e","e","e","e","e","e","e","e","e","e",{t:'e', e: rb},	"e",		"e","e","e","e","e",{t: "e", e: lb}]
		["e","e","e","e","e","e","e","e","e",{t:'e',e:ltb},{t: 'e', e: rb}]
		["e","e","e","e","e","e","e","e","e","e"]
		["e"]
		["e"]
		["e"]
		["e"]
		["e"]
		["e"]
		["e"]
	]
	mapObj[1][0] = [
	]

	# Take each chunk defined above (will move to JSON map files) and load it into a full array of bitmaps
	for i in [0..1] then for j in [0..1]
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