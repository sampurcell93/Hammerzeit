(function() {
  define(["utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], function(ut, board, dialog, globals, runner, player, mapper, controls) {
    var PC, fullMap, i, j, mapObj, stage, t, _i, _j, _k;
    PC = player.PC;
    stage = board.getStage();
    mapObj = [];
    fullMap = [];
    for (i = _i = 0; _i <= 1; i = ++_i) {
      mapObj[i] = [];
      fullMap[i] = [];
    }
    t = ut.tileEntryCheckers;
    mapObj[0][0] = [
      [
        {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "trb"
        }, {
          "t": "e",
          "e": "tbl"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }
      ], [
        {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "f"
        }, {
          "t": "e",
          "e": "rb"
        }, {
          "t": "e",
          "e": "e"
        }, {
          "t": "e",
          "e": "tbl"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }
      ], [
        {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }
      ], [
        {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }
      ], [
        {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }
      ], [
        {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }
      ], [
        {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }
      ], [
        {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }
      ], [
        {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }
      ], [
        {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }
      ], [
        {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }
      ], [
        {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }
      ], [
        {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }
      ], [
        {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }, {
          "t": "e"
        }
      ]
    ];
    for (i = _j = 0; _j <= 0; i = ++_j) {
      for (j = _k = 0; _k <= 0; j = ++_k) {
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
