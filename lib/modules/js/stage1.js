(function() {
  define(["utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], function(ut, board, dialog, globals, runner, player, mapper, controls) {
    var PC, bot, fullMap, i, j, lt, mapObj, rt, stage, top, _i, _j, _k;
    PC = player.PC;
    stage = board.getStage();
    mapObj = [];
    fullMap = [];
    for (i = _i = 0; _i <= 1; i = ++_i) {
      mapObj[i] = [];
      fullMap[i] = [];
    }
    lt = function(x, y) {
      return x > 0;
    };
    rt = function(x, y) {
      return x < 0;
    };
    top = function(x, y) {
      return y > 0;
    };
    bot = function(x, y) {
      return y < 0;
    };
    mapObj[0][0] = [
      ["p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "e", "e", "p", "p", "p", "p"], ["p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "e", "e", "p", "p", "p", "p"], [
        "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", {
          t: "e",
          e: bot
        }, {
          t: 'e',
          e: function(x, y) {
            return bot(x, y) || rt(x, y);
          }
        }
      ], ["e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e"], [], [], [], [], [], [], [], [], [], []
    ];
    mapObj[1][0] = [];
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
                mapper.renderChunk(fullMap[0][0], stage);
                board.addState("TRAVEL").removeState("WAITING");
                board.addMarker(PC);
                PC.marker.y = 500;
                return board.setBackground("images/tiles/hometown.jpg");
              }
            }
          }
        ]);
      }
    };
  });

}).call(this);
