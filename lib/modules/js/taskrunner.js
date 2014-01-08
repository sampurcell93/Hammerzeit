(function() {
  define(["utilities", "board", "player", "controls"], function(ut, board, player, controls) {
    board = null;
    return {
      initialize: function(linked_board) {
        return board = linked_board;
      },
      loadStage: function(module) {
        return require(["lib/modules/js/stage" + module], function(stage) {
          ut.c("board", board);
          return stage.initialize(board);
        });
      }
    };
  });

}).call(this);
