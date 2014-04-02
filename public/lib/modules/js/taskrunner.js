(function() {
  define(["globals", "utilities", "battler", "board", "player", "controls", "mapper", "mapcreator", "menus", "underscore"], function(globals, ut, battler, board, player, controls, mapper, mapcreator, menus) {
    var taskrunner;
    window.PC = player.PC;
    taskrunner = {
      newGame: function() {
        return this.loadStage(1);
      },
      loadStage: function(module) {
        board.addState("LOADING");
        return require(["lib/modules/js/stage" + module], function(level) {
          board.removeState("LOADING");
          level.events.on("doneloading", function() {
            return level.initialize();
          });
          return PC.on("change:current_chunk", function() {
            var full_chunk, newchunk;
            ut.c("CHUNK CHANGE REGISTERED IN TASKRUNNER");
            newchunk = PC.get("current_chunk");
            board.setBackground(level.getBackground());
            mapcreator.loadChunk(level.getBitmap()[newchunk.y][newchunk.x], newchunk.x, newchunk.y);
            mapcreator.render();
            console.log(board.getState());
            full_chunk = level.getBitmap()[newchunk.y][newchunk.x];
            mapper.renderChunk(full_chunk, board.getStage());
            menus.battleMenu.clearPotentialMoves();
            if (board.hasState("battle")) {
              battler.activateGrid();
            }
            return console.log(board.getState());
          });
        });
      }
    };
    return taskrunner;
  });

}).call(this);
