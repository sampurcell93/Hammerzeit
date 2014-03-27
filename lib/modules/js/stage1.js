(function() {
  define(["mapcreator", "utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], function(mapcreator, ut, board, dialog, globals, runner, player, mapper, controls) {
    var PC, generateChunkSprite, stage, _fullMap, _stageObj,
      _this = this;
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
    $.getJSON("lib/json_packs/stage1.json", function(json) {
      var f, i, j, map, _i, _j, _k, _ref, _ref1, _ref2;
      _stageObj = json;
      for (f = _i = 0, _ref = _stageObj.height; 0 <= _ref ? _i < _ref : _i > _ref; f = 0 <= _ref ? ++_i : --_i) {
        _fullMap[f] = [];
      }
      map = _stageObj.map;
      for (i = _j = 0, _ref1 = _stageObj.width; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        for (j = _k = 0, _ref2 = _stageObj.height; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; j = 0 <= _ref2 ? ++_k : --_k) {
          map[j][i].background_position = generateChunkSprite(map[j][i], j, i);
          _fullMap[j][i] = mapper.loadChunk(map[j][i]);
        }
      }
      return console.log(map);
    });
    return {
      fullMap: _fullMap,
      getMap: function() {
        return _stageObj.map;
      },
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
                mapper.renderChunk(_fullMap[0][0], stage);
                board.addState("TRAVEL").removeState("WAITING");
                board.addMarker(PC);
                PC.trigger("change:current_chunk");
                return PC.marker.y = 400;
              }
            }
          }
        ]);
      }
    };
  });

}).call(this);
