# 38 up 37 left 39 right 40 down
define ["utilities", "dialog", "jquery"], (ut, dialog) ->
	require ["board"], (board) ->
		$c = board.$canvas.focus()

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
		}

		# Todo
		Number.prototype.isStateDependent = ->
			true

		generalFns =
			91: (e) ->


		stateFns = {
			INTRO: (key) ->
				switch key
					when kc["NEW"] then board.newGame()
			WAITING: (key) ->
			BATTLE: (key) ->
			CUTSCENE: (key) ->
			TRAVEL: (key) ->
				switch key
					when kc["DOWN"]
						ut.c "moving down bro"
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
			if key.isStateDependent()
				if $.isArray state
					_.each state, (ins) ->
						stateFns[ins](key)
				else 
					stateFns[state](key)
			else if generalFns.hasOwnProperty(key) 
				generalFns[key](e)

		$c.on "keydown", (e) =>
			if !board.getKeysDisabled() then delegate(key = e.keyCode || e.which, board.getState(), e)
			
