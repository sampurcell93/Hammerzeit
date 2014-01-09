define ["utilities", "board", "player", "controls", "mapper", "underscore"], (ut, board, player, controls, mapper) ->
	return {
		initialize: (linked_board) ->
			board = linked_board
		loadStage: (module) ->
			board.setState "LOADING"
			require ["lib/modules/js/stage" + module], (stage) ->
				board.removeState "LOADING"
				stage.initialize()
	}