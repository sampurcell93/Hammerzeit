(function() {
  define(["board", "globals", "utilities", "npc", "player", "backbone", "underscore", "jquery"], function(board, globals, ut, NPC, player) {
    var BattleRunner, _board, _shared;
    _shared = globals.shared_events;
    _shared.on("battle", function() {
      return ut.c("battle timed");
    });
    _board = null;
    BattleRunner = (function() {
      function BattleRunner() {}

      return BattleRunner;

    })();
    return {
      BattleRunner: BattleRunner,
      loadBoard: function(board) {
        return _board = board;
      },
      getActivePlayer: function() {
        return player.PC;
      }
    };
  });

}).call(this);
