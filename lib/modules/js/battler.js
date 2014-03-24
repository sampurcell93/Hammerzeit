(function() {
  define(["utilities", "backbone", "underscore", "jquery"], function(ut) {
    var BattleRunner, _board;
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
