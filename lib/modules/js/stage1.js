(function() {
  define(["mapcreator", "utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], function(mapcreator, ut, board, dialog, globals, runner, player, mapper, controls) {
    var PC, fullMap, i, stage, _i, _stageObj,
      _this = this;
    PC = player.PC;
    stage = board.getStage();
    _stageObj = {};
    fullMap = [];
    for (i = _i = 0; _i <= 1; i = ++_i) {
      fullMap[i] = [];
    }
    $.getJSON("lib/json_packs/stage1.json", function(json) {
      var j, map, _j, _ref, _results;
      _stageObj = json;
      map = _stageObj.map;
      _results = [];
      for (i = _j = 0, _ref = _stageObj.width; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
        _results.push((function() {
          var _k, _ref1, _results1;
          _results1 = [];
          for (j = _k = 0, _ref1 = _stageObj.height; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; j = 0 <= _ref1 ? ++_k : --_k) {
            _results1.push(fullMap[j][i] = mapper.loadChunk(map[j][i]));
          }
          return _results1;
        })());
      }
      return _results;
    });
    return {
      fullMap: fullMap,
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
                mapper.renderChunk(fullMap[0][0], stage);
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
