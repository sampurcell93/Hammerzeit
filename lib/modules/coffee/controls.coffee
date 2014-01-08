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
		}

		# Todo
		Number.prototype.isStateDependent = ->
			true

		generalFns =
			13: ->

		stateFns = {
			0: (key) ->
				switch key
					when kc["NEW"] then board.newGame()
			1: (key) ->
			2: (key) ->
			3: (key) ->
			4: (key) ->
			5: (key) ->
				switch key
					when kc["ENTER"], kc["SPACE"]
						ut.c "finish dialog"
						dialog.finish()
					when kc['ESCAPE'] then dialog.clear()
		}

		# High level delegator based on the key pressed and the current board state.
		delegate = (key, state) ->
			if key.isStateDependent()
				stateFns[state](key)
			else if generalFns.hasOwnProperty(key) 
				generalFns[key]()

		$c.on "keydown", (e) =>
			if !board.getKeysDisabled() then delegate(key = e.keyCode || e.which, board.getState())
			
