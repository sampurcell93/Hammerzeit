define ["utilities", "board", "player", "controls"], (ut, board, player, controls) ->
	board = null
	return {
		initialize: (linked_board) ->
			board = linked_board
		loadStage: (module) ->
			require ["lib/modules/js/stage" + module], (stage) ->
				ut.c "board", board
				stage.initialize board
	}