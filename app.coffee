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
		'board'		: 'lib/modules/js/board'
		'dialog'	: 'lib/modules/js/dialog'
		'controls'	: 'lib/modules/js/controls'
		'npc'		: 'lib/modules/js/npc'
		'player'	: 'lib/modules/js/player'
		'taskrunner': 'lib/modules/js/taskrunner'
		'mapper'	: 'lib/modules/js/mapper'
		'traveler'	: 'lib/modules/js/travel'


define ['utilities', 'board', 'taskrunner'], (ut, board, taskrunner) ->
	# Bind the taskrunner controller to the board.
	taskrunner.initialize board
	# Setup home screen on board, and bind taskrunner
	board.initialize taskrunner