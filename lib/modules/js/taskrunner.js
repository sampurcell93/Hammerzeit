(function() {
  define(["utilities", "board", "player", "controls", "mapper", "underscore"], function(ut, board, player, controls, mapper) {
    var PC;
    PC = player.PC;
    return {
      initialize: function(linked_board) {
        return board = linked_board;
      },
      newGame: function() {
        return this.loadStage(1);
      },
      loadStage: function(module) {
        board.addState("LOADING");
        return require(["lib/modules/js/stage" + module], function(stage) {
          board.removeState("LOADING");
          return stage.initialize();
        });
      }
    };
  });

}).call(this);
