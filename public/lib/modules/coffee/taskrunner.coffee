define ["globals", "utilities", "board", "player", "controls", "mapper", "mapcreator", "underscore"], (globals, ut, board, player, controls, mapper, mapcreator) ->
	window.PC = player.PC

	taskrunner = {
		newGame: () ->
			@loadStage 1
		loadStage: (module) ->
			board.addState "LOADING"
			# Stage not to be confused with "level": Rename todo
			require ["lib/modules/js/stage" + module], (level) ->
				board.removeState("LOADING")
				level.initialize()
				PC.on "change:current_chunk", () ->
					ut.c "CHUNK CHANGE REGISTERED IN TASKRUNNER"
					newchunk = PC.get "current_chunk"
					mapcreator.loadChunk level.getMap()[newchunk.y][newchunk.x].tiles, newchunk.x, newchunk.y
					full_chunk = level.fullMap[newchunk.y][newchunk.x]
					mapper.renderChunk full_chunk, board.getStage()
					mapcreator.bindModels full_chunk, newchunk.x, newchunk.y

	}
	taskrunner