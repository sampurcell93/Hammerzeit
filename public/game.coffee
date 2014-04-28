require.config
	# Dev: prevents caching
	urlArgs: "bust=" + (new Date()).getTime()
	paths: 
		'jquery'	: 'lib/jquery'
		'jquery-ui'	: 'lib/jquery-ui.min'
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
		'mapcreator': 'lib/modules/js/mapcreator'
		'mapper'	: 'lib/modules/js/mapper'
		'traveler'	: 'lib/modules/js/travel'
		'battler'	: 'lib/modules/js/battler'
		'menus'		: 'lib/modules/js/menus'
		'items'		: 'lib/modules/js/items'
		'powers'	: 'lib/modules/js/powers'
		'cast'		: 'lib/modules/js/cast'
		'console'	: 'lib/modules/js/console'


define ['utilities', 'board', 'taskrunner', "controls"], (ut, board, taskrunner) ->