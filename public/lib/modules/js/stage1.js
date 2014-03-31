(function() {
  define(["mapcreator", "utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], function(mapcreator, ut, board, dialog, globals, runner, player, mapper, controls) {
    var PC, generateChunkSprite, stage, _fullMap, _initialize, _stageObj, _triggers,
      _this = this;
    _triggers = {
      "test": function() {
        return alert("you triggered my trap");
      }
    };
    PC = player.PC;
    stage = board.getStage();
    _stageObj = {};
    _fullMap = [];
    generateChunkSprite = function(chunk, j, i) {
      var str;
      if (chunk.background_position === true) {
        str = "-" + globals.map.width * i + "px ";
        str += "-" + globals.map.height * j + "px";
        return str;
      } else {
        return chunk.background_position;
      }
    };
    _initialize = function() {
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
              mapper.renderChunk(_fullMap[0][0], stage);
              board.addState("TRAVEL").removeState("WAITING");
              board.addMarker(PC);
              console.log("loaded board");
              console.log(_stageObj);
              board.setMapSize(_stageObj.width * globals.map.width, _stageObj.height * globals.map.height);
              PC.trigger("change:current_chunk");
              return PC.marker.y = 500;
            }
          }
        }
      ]);
    };
    $.getJSON("lib/json_packs/stage1.json", function(json) {
      var chunk, f, i, j, map, _i, _j, _k, _ref, _ref1, _ref2;
      _stageObj = json;
      for (f = _i = 0, _ref = _stageObj.height; 0 <= _ref ? _i < _ref : _i > _ref; f = 0 <= _ref ? ++_i : --_i) {
        _fullMap[f] = [];
      }
      map = _stageObj.map;
      for (i = _j = 0, _ref1 = _stageObj.width; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        for (j = _k = 0, _ref2 = _stageObj.height; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; j = 0 <= _ref2 ? ++_k : --_k) {
          chunk = map[j][i];
          chunk.background_position = generateChunkSprite(chunk, j, i);
          if (!chunk.tiles) {
            chunk.tiles = mapcreator.getDefaultChunk();
          } else {
            console.log("getting chunk for first one");
            console.log(chunk);
            _.each(chunk.tiles, function(row) {
              return _.each(row, function(tile) {
                if (tile.trigger) {
                  return tile.trigger = _triggers[tile.trigger];
                }
              });
            });
          }
          _fullMap[j][i] = mapper.loadChunk(chunk);
        }
      }
      return _initialize();
    });
    return {
      fullMap: _fullMap,
      getMap: function() {
        return _stageObj.map;
      },
      initialize: _initialize
    };
  });

}).call(this);
