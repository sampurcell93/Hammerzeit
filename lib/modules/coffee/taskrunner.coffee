define ["globals", "utilities", "board", "player", "controls", "mapper", "underscore"], (globals, ut, board, player, controls, mapper) ->
	window.PC = player.PC

	taskrunner = {
		initialize: (linked_board) ->
			board = linked_board
		newGame: () ->
			@loadStage 1
		loadStage: (module) ->
			board.addState "LOADING"
			# Stage not to be confused with "level": Rename todo
			require ["lib/modules/js/stage" + module], (level) ->
				board.removeState "LOADING"
				level.initialize()
				PC.on "change:current_chunk", ->
					ut.c "CHUNK CHANGE REGISTERED IN TASKRUNNER"
					newchunk = PC.get "current_chunk"
					# ut.c level.pictoMap[newchunk.y][newchunk.x]
					# ut.c "BEFORE"
					# console.log board.getStage().children.slice(0)
					# mapper.clearChunk level.fullMap[0][0], board.getStage()
					# ut.c "AFTER"
					# console.log board.getStage().children
					mapper.renderChunk level.fullMap[newchunk.y][newchunk.x], board.getStage()


	}

	taskrunner