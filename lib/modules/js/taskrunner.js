(function() {
  define(["utilities", "board", "player", "controls", "mapper", "underscore"], function(ut, board, player, controls, mapper) {
    return {
      initialize: function(linked_board) {
        return board = linked_board;
      },
      loadStage: function(module) {
        board.setState("LOADING");
        return require(["lib/modules/js/stage" + module], function(stage) {
          board.removeState("LOADING");
          return stage.initialize();
        });
      }
    };
  });

}).call(this);
