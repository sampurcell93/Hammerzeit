(function() {
  define(["utilities", "board", "dialog", "globals", "taskrunner", "mapper", "traveler", "npc", "player", "underscore", "jquery"], function(ut, board, dialog, globals, runner, mapper, traveler, NPC, player) {
    var PC, g, i, r, stage, t, ten, _i;
    PC = player.PC;
    stage = board.getStage();
    g = [];
    r = [];
    t = [];
    ten = [];
    for (i = _i = 0; _i < 14; i = ++_i) {
      g.push("g");
      r.push("wh");
      ten.push("ten");
      t.push("t");
    }
    window.mapObj = [[r, r, r, r, r, r, r, r, r, r, r, r, r, r], [g, g, g, g, g, g, g, g, g, g, g, g, g, g]];
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
