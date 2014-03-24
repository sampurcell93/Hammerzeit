# 38 up 37 left 39 right 40 down
define ["utilities", "globals", "dialog", "npc", "mapper", "player", "jquery"], (ut, globals, dialog, NPC, mapper, player) ->
	require ["board", "taskrunner"], (board, taskrunner) ->
		PC = player.PC
		$c = board.$canvas.focus()
		keysdisabled = false

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
			CLEAR: 67
		}

		# Todo
		Number.prototype.isStateDependent = ->
			true

		generalFns =
			91: (e) ->

		stateFns = {
			INTRO: (key) ->
				switch key
					when kc["NEW"] then taskrunner.newGame()
			WAITING: (key) ->
			BATTLE: (key) ->
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
			else if generalFns.hasOwnProperty(key) 
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
