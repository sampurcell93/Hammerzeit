(function() {
  define(["globals", "utilities", "backbone", "underscore", "jquery"], function(globals, ut) {
    var BattleRunner, _board, _shared;
    _shared = globals.shared_events;
    _shared.on("battle", function() {});
    _board = null;
    BattleRunner = (function() {
      function BattleRunner() {}

      return BattleRunner;

    })();
    return {
      BattleRunner: BattleRunner,
      loadBoard: function(board) {
        return _board = board;
      }
    };
  });

}).call(this);