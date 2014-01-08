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
		'player'	: 'lib/modules/js/player'
		'npc'		: 'lib/modules/js/npc'
		'taskrunner': 'lib/modules/js/taskrunner'

define ['utilities', 'board', 'player', 'npc', 'taskrunner'], (ut, board, PC, NPC, taskrunner) ->
	# Bind the taskrunner controller to the board.
	taskrunner.initialize board
	# Setup home screen on board, and bind taskrunner
	board.initialize taskrunner



	# sheet = new createjs.SpriteSheet
	# 	framerate: 30
	# 	frames: 
	# 		width: 64
	# 		height: 64
	# 		numFrames: 16
	# 	animations: 
	# 		run: [0,15]
	# 	images: ["images/spritetemplate.png"]
	# sheet.getAnimation("run").speed = .1
	# sheet.getAnimation("run").next = "run"
	# sprite = new createjs.Sprite(sheet, "run")
	# sprite.scaleY = sprite.scaleX = 1
	# board.stage.addChild(sprite);
	# ut.c player
	# # shape.graphics.beginFill("rgba(25,101,101,.5)").drawRoundRect 10, 10, 33, 120, 0
	# board.stage.addChild shape
	# do board.stage.update