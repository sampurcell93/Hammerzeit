define ["globals", "utilities", "battler", "board", "player", "controls", "mapper", "mapcreator", "menus", "underscore"], (globals, ut, battler, board, player, controls, mapper, mapcreator, menus) ->
	window.PC = player.PC


	taskrunner = {
		newGame: () ->
			@loadStage 1
		loadStage: (module) ->
			board.addState "LOADING"
			# Stage not to be confused with "level": Rename todo
			require ["lib/modules/js/stage" + module], (level) ->
				board.removeState("LOADING")
				PC.on "change:current_chunk", () ->
					ut.c "CHUNK CHANGE REGISTERED IN TASKRUNNER"
					newchunk = PC.get "current_chunk"
					board.setBackground(level.getBackground())
					mapcreator.loadChunk(level.getBitmap()[newchunk.y][newchunk.x], newchunk.x, newchunk.y)
					mapcreator.render()
					full_chunk = level.getBitmap()[newchunk.y][newchunk.x]
					mapper.renderChunk full_chunk, board.getStage()
					battler.clearPotentialMoves()
	}
	globals.shared_events.on "newgame", -> taskrunner.newGame()

	taskrunner