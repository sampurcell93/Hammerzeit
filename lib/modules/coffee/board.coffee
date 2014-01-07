define "board", ['globals', 'utilities', 'player', 'npc', 'jquery', 'underscore', 'easel'], (globals, ut, PC, NPC) ->
	canvas = document.getElementById "game-board"

	$.fn.extend
		changeBg: (url, options) ->
			num = @
			@css("background", "url(" + url + ") no-repeat")
			@css("background-size", "700px 700px")

	states = {
		INACTIVE: 0
		WAITING: 1
	}

	stage = new createjs.Stage canvas
	stage.enableMouseOver 1000
	board = {
		canvas: canvas
		$canvas: $(canvas)
		stage: stage
		ctx: canvas.getContext "2d"
		state: states.WAITING
	}

	scenecount = 0
	scenelen = 6
	giveBg = -> board.$canvas.attr "bg", ("image-" + parseInt(((scenecount++)%scenelen)+1))

	startSlideshow = ->
		giveBg()
		globals.introScenery = setInterval ->
			unless scenecount == 7
				giveBg()
			else
				clearInterval globals.introScenery
				globals.introScenery = setInterval giveBg, 12000
		, 1

	initialize = () ->
		startSlideshow()
		textshadow = new createjs.Shadow("#000000", 0,0,7)
		# Make title text
		title = new createjs.Text(globals.name + " v " + globals.version, "50px Arial", "#f9f9f9")
		_.extend title, { x: 140, y: 100, shadow: textshadow }
		# Make new game button
		newgame = new createjs.Text("New Game", "30px Arial", "#f9f9f9")
		_.extend newgame, {x: 140, y: 280, shadow: textshadow, cursor: 'pointer', mouseEnabled: true}
		newgame.addEventListener "click", ->
			ut.c "Bout to embark!"
		# Make load game button
		loadgame = new createjs.Text("Load Game", "30px Arial", "#f9f9f9")
		_.extend loadgame, {x: 380, y: 280, shadow: textshadow, cursor: 'pointer', mouseEnabled: true}
		ut.addEventListeners loadgame, {
			"click": ->
				ut.c "load, you say?"
			"mouseover": ->
				loadgame.color = "white"
			"mouseout": ->
				loadgame.font = "30px Arial"
		}
		# Make copyright
		copyright = new createjs.Text("Game copyright Sam Purcell 2014", "14px Arial", "rgba(255,255,255,.5)")
		_.extend copyright, {x: 10, y: 680, shadow: textshadow}
		board.stage.addChild newgame, loadgame, title, copyright
		board.stage.update()
	do initialize 
	board
