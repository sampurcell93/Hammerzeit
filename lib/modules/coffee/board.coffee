define "board", ['utilities', 'player', 'npc', 'jquery', 'underscore', 'easel'], (ut, PC, NPC, $ ) ->
	canvas = document.getElementById "game-board"
	states = {
		INACTIVE: 0
		WAITING: 1
	}

	board = {
		canvas: canvas
		$canvas: $(canvas)
		stage: new createjs.Stage canvas
		ctx: canvas.getContext "2d"
		state: states.WAITING
	}

	initialize = () ->
		title = new createjs.Text("Hammerzeit.", "50px Arial", "#f9f9f9")
		_.extend title, { shadow: new createjs.Shadow("#000000", 0,0,10) }
		board.stage.addChild title
		board.stage.update()
		# createjs.Ticker.addEventListener("tick", (e) -> ut.c "hello");
	do initialize 
	board
