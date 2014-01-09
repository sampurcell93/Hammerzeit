require.config
	# Dev: prevents caching
	urlArgs: "bust=" + (new Date()).getTime()
	paths: 
		'jquery'	: 'lib/jquery'
		'easel'		: 'lib/easel'
		'underscore': 'lib/underscore'
		'backbone'	: 'lib/backbone'
		'globals'	: 'lib/modules/js/globals'
		'utilities' : 'lib/modules/js/utilities'
		'dialog'	: 'lib/modules/js/dialog'
		'board'		: 'lib/modules/js/board'
		'controls'	: 'lib/modules/js/controls'
		'npc'		: 'lib/modules/js/npc'
		'player'	: 'lib/modules/js/player'
		'taskrunner': 'lib/modules/js/taskrunner'
		'mapper'	: 'lib/modules/js/mapper'
		'traveler'	: 'lib/modules/js/travel'


define ['utilities', 'board', 'player', 'npc', 'taskrunner', 'traveler'], (ut, board, PC, NPC, taskrunner) ->
	# Bind the taskrunner controller to the board.
	taskrunner.initialize board
	# Setup home screen on board, and bind taskrunner
	board.initialize taskrunner