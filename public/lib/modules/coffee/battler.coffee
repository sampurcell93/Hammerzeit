define ["board", "globals", "utilities", "npc", "player", "backbone", "underscore", "jquery"], (board, globals, ut, NPC, player) ->

    _shared = globals.shared_events
    _shared.on "battle", ->
        ut.c "battle timed"

    _board = null

    class BattleRunner
      

    {
        BattleRunner: BattleRunner
        loadBoard: (board) ->
            _board = board
        getActivePlayer: ->
            player.PC
    }
