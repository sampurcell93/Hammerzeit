define ["utilities", "board", "globals", "underscore", "jquery"], (ut, board, globals) ->
	stage = board.getStage()
	states = globals.states
	textshadow = globals.textshadow
	dialog = 
		drawrate: 20
		drawroutine: null
		background: ->
			shape = new createjs.Shape()
			shape.graphics.beginFill("#000").drawRect(0,0,200,100)
			# stage.addChild shape
		initialize: (background) ->
			board.setState states.DRAWING
			# @background()
		default: 
			textstyles: {x: 20, y : 300,  shadow: textshadow, maxWidth: 660, lineHeight: 22, lineWidth: 660}
			instant: false
		draw: (text, opts) ->
			opts = $.extend true, @default, (opts || {})
			if opts.before then opts.before.call @
			i = 0
			if typeof text is "function" then text = text()
			@current_text = text = text.split(" ")
			visible = ""
			index = @current_display_index = null
			if opts.instant
				@finish opts
				return
			@drawroutine = setInterval =>
				# Once we've reached the end, stop writing and break interval
				if !text[i] 
					clearInterval @drawroutine 
					if opts.after then opts.after.call @
					return
				# Otherwise add word by word
				alltext = new createjs.Text visible + " " + text[i], "16px Arial", "#fff"
				_.extend alltext, opts.textstyles
				stage.removeChildAt index
				stage.addChild alltext
				index = stage.getChildIndex alltext
				visible += " " + text[i]
				i++
			, opts.speed || @drawrate
		clear: ->
			stage.removeChildAt @current_display_index
		finish: (opts) ->
			opts = $.extend true, @default, (opts || {})
			clearInterval @drawroutine
			@current_text = @current_text.join(" ")
			text = new createjs.Text @current_text, "16px Arial", "#fff"
			_.extend text, opts.textstyles
			unless opts.instant then stage.removeChildAt @current_display_index
			stage.addChild text
			board.setState states.WAITING
		destroy: ->
			@remove()
			board.setState states.WAITING
		waitThen: (callback, time, donestate) ->
			callback || (callback = ->)
			setTimeout ->
				do callback
				if donestate then board.setState donestate
			, time
		dialogSetHelper: (set, i) ->
			blurb = set[i]
			if !blurb? then return
			@draw blurb.text, (blurb.options || {})
			@clear()
			@waitThen =>
				@dialogSetHelper set, ++i
			, blurb.delay
		loadDialogSet: (set) ->
			ut.c "wrapper"
			if !set.length then return
			@dialogSetHelper set, 0

	return {
		initialize: ->
			dialog.initialize()
			@
		draw: (text) ->
			dialog.draw text
			@
		clear: ->
			dialog.clear()
			@
		# Removes all dialogs
		remove: ->
			dialog.remove()
			@
		#  By default dialog draws word by word. Finish just finishes that blob
		finish: ->
			dialog.finish()
			@
		# Return to waiting state
		destroy: ->
			dialog.destroy()
			@
		# Wait time ms, then execute callback. [donestate] is the state to set the machine to when done
		waitThen:  (callback, time, donestate) ->
			dialog.waitThen callback, time
			@
		# Expects an array of objects, each of which containing a blurb of text, and the delay until the next should appear
		loadDialogSet: (text) ->
			dialog.loadDialogSet text
	}	