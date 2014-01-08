define ['globals', 'utilities', 'player', 'npc', 'jquery', 'underscore', 'easel'], (globals, ut, PC, NPC) ->
	canvas = document.getElementById "game-board"
	$canvas = $ canvas

	# State enum
	globals.states = states = {
		INTRO: 0
		WAITING: 1
		BATTLE: 2
		CUTSCENE: 3
		TRAVEL: 4
		DRAWING: 5
	}

	stage = new createjs.Stage canvas
	stage.enableMouseOver 1000
	ticker = createjs.Ticker
	ticker.addEventListener "tick", (tick) ->
		stage.update() unless tick.paused
	state = states.INTRO
	taskrunner = null
	keysDisabled = false
	textshadow = globals.textshadow = new createjs.Shadow("#000000", 0,0,7)

	scenecount = 0
	scenelen = 6
	giveBg = (count) -> 
		if count == -1 then $canvas.attr "bg", "image-none"
		else $canvas.attr "bg", ("image-" + parseInt(((count || scenecount++)%scenelen)+1))

	startSlideshow = ->
		giveBg()
		globals.introScenery = setInterval ->
			unless scenecount == 7
				giveBg()
			else
				clearInterval globals.introScenery
				globals.introScenery = setInterval giveBg, 12000
		, 0

	newGame = ->
		ut.c "About to embark!"
		taskrunner.loadStage 1

	initialize = (runner) ->
		taskrunner = runner
		startSlideshow()
		# Make title text
		title = new createjs.Text(globals.name + " v " + globals.version, "50px Arial", "#f9f9f9")
		_.extend title, { x: 140, y: 100, shadow: textshadow }
		# Make new game button
		newgame = new createjs.Text("New Game", "30px Arial", "#f9f9f9")
		_.extend newgame, {x: 140, y: 280, shadow: textshadow, cursor: 'pointer', mouseEnabled: true}
		newgame.addEventListener "click", newGame

		# Make load game button
		loadgame = new createjs.Text("Load Game", "30px Arial", "#f9f9f9")
		_.extend loadgame, {x: 380, y: 280, shadow: textshadow, cursor: 'pointer', mouseEnabled: true}
		ut.addEventListeners loadgame, {
			"click": ->
				ut.c "load, you say?"
			"mouseover": ->
				loadgame.font = "bold 30px Arial"
			"mouseout": ->
				loadgame.font = "30px Arial"
		}
		# Make copyright
		copyright = new createjs.Text("Game copyright Sam Purcell 2014", "14px Arial", "rgba(255,255,255,.5)")
		_.extend copyright, {x: 10, y: 680, shadow: textshadow}
		stage.addChild newgame, loadgame, title, copyright
		ut.c stage.getChildIndex copyright

	clear = ->
		stage.removeAllChildren()
		clearInterval globals.introScenery
		giveBg 3
		stage.clear()
	setState = (newstate) ->
		if typeof newstate is "number"
			state = newstate
		else state = states[newstate.toUpperCase()]

	window.board = {
		canvas: canvas
		$canvas: $canvas
		ctx: canvas.getContext "2d"
		newGame: ->
			newGame()
			@
		getState: -> state
		getStage: -> stage
		# Takes in the taskrunner codependency
		initialize: (runner) ->
			initialize runner
			@
		setState: (newstate) -> 
			setState newstate
			@
		clear: ->
			clear()
			@
		getKeysDisabled: -> 
			keysDisabled
		setKeysDisabled: (status) ->
			keysDisabled = status
			@
	}