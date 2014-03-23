(function() {
  define(["utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], function(ut, board, dialog, globals, runner, player, mapper, controls) {
    var PC, g, r, stage, t, ten;
    PC = player.PC;
    stage = board.getStage();
    g = [];
    r = [];
    t = [];
    ten = [];
    window.mapObj = [["g", "g", "g", "g", "g"]];
    return {
      initialize: function() {
        board.clear();
        clearInterval(globals.introScenery);
        dialog.initialize();
        return dialog.loadDialogSet([
          {
            text: " YOLO ",
            options: {
              delay: 1000,
              speed: 82,
              after: function() {
                board.setPresetBackground("");
                dialog.destroy();
                mapper.renderMap(mapper.loadMap(mapObj), stage);
                board.addState("TRAVEL").removeState("WAITING");
                return board.addCharacter(PC);
              }
            }
          }
        ]);
      }
    };
  });

}).call(this);
