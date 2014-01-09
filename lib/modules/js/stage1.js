(function() {
  define(["utilities", "board", "dialog", "globals", "taskrunner", "mapper", "traveler", "underscore", "jquery"], function(ut, board, dialog, globals, runner, mapper, traveler) {
    var g, i, mapObj, stage, _i;
    stage = board.getStage();
    g = [];
    for (i = _i = 0; _i <= 10; i = ++_i) {
      g.push("g");
    }
    mapObj = [["g", "gwbr", "w", "gwtl", g], ["gwbr", "w", "gwtl", "g", g], ["w", "gwtl", "g", g], ["w", "gwbl", "g", g], ["gwtr", "w", "gwbl", g], ["g", "gwtr", "gwtl", g]];
    return {
      initialize: function() {
        board.clear();
        dialog.initialize();
        return dialog.loadDialogSet([
          {
            text: 'Perhaps I should show them to you, before they are gone forever. Someone needs to understand. Someone needs to see my homeland...',
            options: {
              delay: 5000,
              speed: 12,
              after: function() {
                board.setPresetBackground("");
                dialog.destroy();
                mapper.renderMap(mapper.loadMap(mapObj), stage);
                return board.addState("TRAVEL").removeState("WAITING");
              }
            }
          }
        ]);
      }
    };
  });

}).call(this);
