(function() {
  define(["globals", "utilities", "board", "player", "controls", "mapper", "mapcreator", "underscore"], function(globals, ut, board, player, controls, mapper, mapcreator) {
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
          level.initialize();
          return PC.on("change:current_chunk", function() {
            var full_chunk, newchunk;
            ut.c("CHUNK CHANGE REGISTERED IN TASKRUNNER");
            newchunk = PC.get("current_chunk");
            mapcreator.loadChunk(level.getMap()[newchunk.y][newchunk.x].tiles, newchunk.x, newchunk.y);
            full_chunk = level.fullMap[newchunk.y][newchunk.x];
            mapper.renderChunk(full_chunk, board.getStage());
            return mapcreator.bindModels(full_chunk, newchunk.x, newchunk.y);
          });
        });
      }
    };
    return taskrunner;
  });

}).call(this);
