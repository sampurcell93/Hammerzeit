define ["utilities", "globals", "dialog", "npc", "mapper", "mapcreator", "battler", "menus", "player", "jquery"], (ut, globals, dialog, NPC, mapper, mapcreator, battler, menus, player) ->
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
	_activeplayer = null

	require ["board", "taskrunner"], (board, taskrunner) ->
		$c = board.$canvas.focus()
		# Todo
		Number.prototype.isStateDependent = ->
			true

		generalFns =
			# G
			71: battler.toggleGrid

		stateFns = {
			INTRO: (key) ->
				switch key
					when kc["NEW"] then taskrunner.newGame()
			WAITING: (key) ->
			BATTLE: (key) ->
				_activeplayer = battler.getActivePlayer()
				ut.c _activeplayer
				switch key
					when kc["UP"] 	 then PC.moveUp()
					when kc["RIGHT"] then PC.moveRight()
					when kc["DOWN"]  then PC.moveDown()
					when kc["LEFT"]  then PC.moveLeft()
					when kc['SPACE'] then menus.toggleMenu("battle")
			CUTSCENE: (key) ->
			TRAVEL: (key) ->
				ut.c PC
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
					when kc['MAPCREATOR'] then mapcreator.toggleOverlay()
					when kc['EXPORTMAP'] then mapcreator.exportMap()
					when kc['DEFAULT'] then ut.launchModal mapcreator.getDefaultChunk().export()
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
			if key.isStateDependent()
				if $.isArray state
					_.each state, (ins) ->
						stateFns[ins](key)
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
