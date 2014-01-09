define ["utilities", "board", "player", "controls", "mapper", "underscore"], (ut, board, player, controls, mapper) ->
	PC = player.PC
	return {
		initialize: (linked_board) ->
			board = linked_board
		newGame: () ->
			@loadStage 1
		loadStage: (module) ->
			board.addState "LOADING"
			require ["lib/modules/js/stage" + module], (stage) ->
				board.removeState "LOADING"
				stage.initialize()

	}