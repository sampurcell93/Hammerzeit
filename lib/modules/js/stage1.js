(function() {
  define(["utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], function(ut, board, dialog, globals, runner, player, mapper, controls) {
    var PC, fullMap, g, i, j, r, stage, t, ten, _i, _j, _k;
    PC = player.PC;
    stage = board.getStage();
    g = [];
    r = [];
    t = [];
    ten = [];
    window.mapObj = [];
    fullMap = [];
    for (i = _i = 0; _i <= 1; i = ++_i) {
      mapObj[i] = [];
      fullMap[i] = [];
    }
    mapObj[0][0] = [["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["wh", "wh", "wh", "wh", "wh", "wh", "wh", "wh", "wh", "wh", "wh", "wh", "wh", "wh"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"]];
    mapObj[0][1] = [["wh", "wh", "wh", "wh", "wh", "wh", "wh", "wh", "wh", "wh", "wh", "wh", "wh", "wh"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"]];
    mapObj[1][0] = [["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["wv", "wv", "wv", "wv", "wv", "wv", "wv", "wv", "wv", "wv", "wv", "wv", "wv", "wv"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"]];
    mapObj[1][1] = [["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"], ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"]];
    for (i = _j = 0; _j <= 1; i = ++_j) {
      for (j = _k = 0; _k <= 1; j = ++_k) {
        fullMap[i][j] = mapper.loadChunk(mapObj[i][j]);
      }
    }
    return {
      fullMap: fullMap,
      pictoMap: mapObj,
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
                mapper.renderChunk(fullMap[0][0], stage, "0,0");
                board.addState("TRAVEL").removeState("WAITING");
                return board.addMarker(PC);
              }
            }
          }
        ]);
      }
    };
  });

}).call(this);
