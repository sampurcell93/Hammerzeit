(function() {
  define(["globals", "utilities", "board", "player", "controls", "mapper", "underscore"], function(globals, ut, board, player, controls, mapper) {
    var taskrunner;
    window.PC = player.PC;
    taskrunner = {
      initialize: function(linked_board) {
        return board = linked_board;
      },
      newGame: function() {
        return this.loadStage(1);
      },
      loadStage: function(module) {
        board.addState("LOADING");
        return require(["lib/modules/js/stage" + module], function(level) {
          board.removeState("LOADING");
          level.initialize();
          return PC.on("change:current_chunk", function() {
            var newchunk;
            ut.c("CHUNK CHANGE REGISTERED IN TASKRUNNER");
            newchunk = PC.get("current_chunk");
            return mapper.renderChunk(level.fullMap[newchunk.y][newchunk.x], board.getStage());
          });
        });
      }
    };
    return taskrunner;
  });

}).call(this);
