define ["utilities", "globals", "dialog", "npc", "mapper", "mapcreator", "battler", "menus", "player", "jquery"], (ut, globals, dialog, NPC, mapper, mapcreator, battler, menus, player) ->
	require ["board", "taskrunner"], (board, taskrunner) ->
		PC = player.PC
		$c = board.$canvas.focus()
		keysdisabled = false
		_activeplayer = null

		# Keycodes
		kc = {
			ENTER: 13
			SPACE: 32
			UP: 38
			DOWN: 40
			LEFT: 37
			RIGHT: 39
			ESCAPE: 27
			NEW: 78
			COMMAND: 91
			BATTLE: 66
			CLEAR: 67
			DEFAULT: 68
			EXPORTMAP: 69
			GRID: 71
			MAPCREATOR: 77
		}

		# Todo
		Number.prototype.isStateDependent = ->
			true

		generalFns =
			# Cmd
			91: (e) ->
			# G
			71: board.toggleGrid

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
					when kc['SPACE'] then menus.launchMenu()
			CUTSCENE: (key) ->
			TRAVEL: (key) ->
				ut.c PC
				switch key
					when kc["UP"]
						ut.c "UP"
						PC.move(0,-1)
					when kc["RIGHT"]
						ut.c "right"
						PC.move(1,0)
					when kc["DOWN"]
						ut.c "down"
						PC.move(0,1)
					when kc["LEFT"]
						ut.c "left"
						PC.move(-1,0)
					when kc['CLEAR']
						mapper.clearChunk window.stage
					when kc['BATTLE']
						board.addState "battle"
					when kc['SPACE']
						menus.launchMenu()
						ut.c 'launching travel menu'
					when kc['MAPCREATOR']
						mapcreator.toggleOverlay()
					when kc['EXPORTMAP']
						mapcreator.exportMap()
					when kc['DEFAULT']
						mapcreator.getDefaultChunk()
			DRAWING: (key) ->
				switch key
					when kc["ENTER"], kc["SPACE"]
						ut.c "finish dialog"
						dialog.finish()
					when kc['ESCAPE'] then dialog.clear()
			LOADING: -> false # Can't do shit when loading brah
		}

		# High level delegator based on the key pressed and the current board state.
		delegate = (key, state, e) ->
			ut.c key
			if key.isStateDependent()
				if $.isArray state
					_.each state, (ins) ->
						stateFns[ins](key)
				else 
					stateFns[state](key)
			if generalFns.hasOwnProperty(key) 
				generalFns[key](e)

		$c.on "keydown", (e) =>
			delegate(key = e.keyCode || e.which, board.getState(), e) unless keysdisabled
			

		return {
			getKeysDisabled: -> 
				keysDisabled
			setKeysDisabled: (status) ->
				keysDisabled = status
				@
		}
