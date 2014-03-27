define ["globals", "utilities", "board", "player", "controls", "mapper", "mapcreator", "underscore"], (globals, ut, board, player, controls, mapper, mapcreator) ->
	window.PC = player.PC

	taskrunner = {
		newGame: () ->
			@loadStage 1
		loadStage: (module) ->
			board.addState "LOADING"
			# Stage not to be confused with "level": Rename todo
			require ["lib/modules/js/stage" + module], (level) ->
				board.removeState "LOADING"
				level.initialize()
				PC.on "change:current_chunk", () ->
					ut.c "CHUNK CHANGE REGISTERED IN TASKRUNNER"
					newchunk = PC.get "current_chunk"
					console.log newchunk
					mapcreator.loadChunk level.getMap()[newchunk.y][newchunk.x].tiles
					mapper.renderChunk level.fullMap[newchunk.y][newchunk.x], board.getStage()


	}
	taskrunner