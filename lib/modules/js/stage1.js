(function() {
  define(["utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], function(ut, board, dialog, globals, runner, player, mapper, controls) {
    var PC, b, fullMap, i, j, l, lb, lr, lrb, lrt, lt, ltb, mapObj, r, rb, rt, rtb, stage, t, tb, _i, _j, _k;
    PC = player.PC;
    stage = board.getStage();
    mapObj = [];
    fullMap = [];
    for (i = _i = 0; _i <= 1; i = ++_i) {
      mapObj[i] = [];
      fullMap[i] = [];
    }
    l = function(x, y) {
      return x > 0;
    };
    r = function(x, y) {
      return x < 0;
    };
    t = function(x, y) {
      return y > 0;
    };
    b = function(x, y) {
      return y < 0;
    };
    lr = function(x, y) {
      return l(x, y) || r(x, y);
    };
    lt = function(x, y) {
      return l(x, y) || t(x, y);
    };
    lb = function(x, y) {
      return l(x, y) || b(x, y);
    };
    lrt = function(x, y) {
      return l(x, y) || r(x, y) || t(x, y);
    };
    lrb = function(x, y) {
      return l(x, y) || r(x, y) || b(x, y);
    };
    ltb = function(x, y) {
      return l(x, y) || b(x, y) || t(x, y);
    };
    rt = function(x, y) {
      return r(x, y) || t(x, y);
    };
    rb = function(x, y) {
      return r(x, y) || b(x, y);
    };
    rtb = function(x, y) {
      return b(x, y) || r(x, y) || t(x, y);
    };
    tb = function(x, y) {
      return b(x, y) || t(x, y);
    };
    mapObj[0][0] = [
      ["p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "e", "e", "p", "p", "p", "p"], [
        "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", {
          t: 'e',
          e: rb
        }, "e", "e", "p", "p", "p", "p"
      ], [
        "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", "p", {
          t: "e",
          e: b
        }, {
          t: 'e',
          e: rb
        }
      ], [
        "p", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", {
          t: 'e',
          e: lt
        }, {
          t: 'e',
          e: rtb
        }
      ], [
        "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", {
          t: 'e',
          e: rb
        }, "e", "e", "e", "e", "e", "e", {
          t: "e",
          e: lb
        }
      ], [
        "e", "e", "e", "e", "e", "e", "e", "e", "e", {
          t: 'e',
          e: ltb
        }, {
          t: 'e',
          e: rb
        }
      ], ["e", "e", "e", "e", "e", "e", "e", "e", "e", "e"], ["e"], ["e"], ["e"], ["e"], ["e"], ["e"], ["e"]
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
