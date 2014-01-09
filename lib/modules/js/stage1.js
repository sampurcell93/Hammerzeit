(function() {
  define(["utilities", "board", "dialog", "globals", "taskrunner", "mapper", "traveler", "npc", "player", "underscore", "jquery"], function(ut, board, dialog, globals, runner, mapper, traveler, NPC, player) {
    var PC, g, i, mapObj, r, stage, t, ten, _i;
    PC = player.PC;
    stage = board.getStage();
    g = [];
    r = [];
    t = [];
    ten = [];
    for (i = _i = 0; _i <= 14; i = ++_i) {
      g.push("g");
      r.push("wh");
      ten.push("ten");
      t.push("t");
    }
    mapObj = [["g", "gwbr", "w", "gwtl", "g", "g", "g", "g", "gwtr", "wh", "wh", "wh", "wh", "gwbl"], ["gwbr", "w", "gwtl", "g", g.slice(0, 9), "wv"], ["w", "gwtl", "g", g.slice(0, 10), "wv"], ["w", "gwbl", "g", g.slice(0, 9), "wh", "gwtl"], ["gwtr", "w", "gwbl", g.slice(0, 11)], ["g", "gwtr", "gwtl", g], ten, t, t, t, t, t, g, r, g, r, g, g];
    return {
      initialize: function() {
        board.clear();
        clearInterval(globals.introScenery);
        dialog.initialize();
        return dialog.loadDialogSet([
          {
            text: 'Perhaps I should show them to you, before they are gone forever. Someone needs to understand. Someone needs to see my homeland...',
            options: {
              delay: 1000,
              speed: 12,
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
