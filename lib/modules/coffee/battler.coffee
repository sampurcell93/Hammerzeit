define ["globals", "utilities", "backbone", "underscore", "jquery"], (globals, ut) ->

    _shared = globals.shared_events
    _shared.on "battle", ->
        # battle = new Battle()
    _board = null

    class BattleRunner
      

    {
        BattleRunner: BattleRunner
        loadBoard: (board) ->
            _board = board
    }
