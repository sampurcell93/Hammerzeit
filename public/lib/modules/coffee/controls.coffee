define ["board", "taskrunner", "utilities", "globals", "dialog", "npc", "mapper", "mapcreator", "battler", "menus", "player", "jquery"], (board, taskrunner, ut, globals, dialog, NPC, mapper, mapcreator, battler, menus, player) ->

	# When the board has multiple states, sometimes commands have to be resolved in a certain order
	_priority_queue = ["CUTSCENE", "MENUOPEN", "DIALOG", "BATTLE", "TRAVEL", "INTRO", "WAITING", "DRAWING", "LOADING"]

	# Keycodes
	kc = {
		ENTER: 13
		SPACE: 32
		UP: 38
		DOWN: 40
		LEFT: 37
		RIGHT: 39
		ESCAPE: 27
		# N
		NEW: 78
		LOADGAME: 76
		COMMAND: 91
		# B
		BATTLE: 66
		# C
		CLEAR: 67
		# D
		DEFAULT: 68
		# E
		EXPORTMAP: 69
		# O
		GRID: 71
		# M
		MAPCREATOR: 77
		# S
		STATE: 83
		# Z
		ZOOMIN: 90
		# O
		ZOOMOUT: 79
	}
	PC = player.PC
	keysdisabled = false

	$c = board.$canvas.focus()
	# Todo
	Number.prototype.isStateDependent = ->
		true

	generalFns =
		# G
		71: battler.toggleGrid
		77: mapcreator.toggleOverlay
		69: mapcreator.exportMap


	stateFns = {
		INTRO: (key) ->
			switch key
				when kc["NEW"] then taskrunner.newGame()
				when kc["LOADGAME"] then taskrunner.loadGame()
		WAITING: (key) ->
		BATTLE: (key) ->
			# Only allow key presses when a player is active
			activeplayer = battler.getActive({player: true})
			if activeplayer?
				switch key
					when kc["UP"] 	 then activeplayer.moveUp()
					when kc["RIGHT"] then activeplayer.moveRight()
					when kc["DOWN"]  then activeplayer.moveDown()
					when kc["LEFT"]  then activeplayer.moveLeft()
					when kc['SPACE'] then menus.toggleMenu()
			else 
				console.log "you can't go now: a player character is NOT active. The active player is "
				console.log battler.getActive()
		CUTSCENE: (key) ->
		TRAVEL: (key) -> 
			switch key
				when kc["UP"] 	 then PC.moveUp()
				when kc["RIGHT"] then PC.moveRight()
				when kc["DOWN"]  then PC.moveDown()
				when kc["LEFT"]  then PC.moveLeft()
				when kc['CLEAR'] then mapper.clearChunk window.stage
				when kc['BATTLE'] 
					board.addState("battle").removeState "travel"
					menus.closeAll()
				when kc['SPACE'] then menus.toggleMenu("travel")
				when kc['DEFAULT'] then ut.launchModal JSON.stringify(mapcreator.getDefaultChunk())
				when kc['ZOOMIN'] then board.zoomIn 1
				when kc['ZOOMOUT'] then board.zoomOut 1
				when kc['STATE'] then console.log board.getState()
		DRAWING: (key) ->
			switch key
				when kc["ENTER"], kc["SPACE"]
					ut.c "finish dialog"
					dialog.finish()
				when kc['ESCAPE'] then dialog.clear()
		MENUOPEN: (key) ->
			switch key
				when kc['UP'] then menus.selectPrev()
				when kc['DOWN'] then menus.selectNext()
				when kc['ENTER'] then menus.activateMenuItem()
				when kc['ESCAPE'] then menus.closeAll()
		LOADING: -> false # Can't do shit when loading brah
	}

	# High level delegator based on the key pressed and the current board state.
	delegate = (key, state, e) ->
		queue = []
		if key.isStateDependent()
			if $.isArray state
				_.each state, (ins) ->
					stateFns[ins].state = ins
					queue[_priority_queue.indexOf(ins)] = stateFns[ins]
				_.each queue, (fn) ->  
					if fn then fn(key)
			else 
				stateFns[state](key)
		if _.has generalFns, key
			generalFns[key](e)

	$c.on "keydown", (e) =>
		delegate(key = e.keyCode || e.which, board.getState(), e) unless keysdisabled
		

	return {
		getKeysDisabled: -> 
			_keysDisabled
		setKeysDisabled: (status) ->
			_keysDisabled = status
			@
		getKeyMap: -> kc
	}
