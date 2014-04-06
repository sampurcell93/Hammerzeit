(function() {
  define(["battler", "mapcreator", "utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], function(battler, mapcreator, ut, board, dialog, globals, runner, player, mapper, controls) {
    var PC, generateChunkSprite, stage, _bitmap, _events, _initialize, _stageObj, _triggers,
      _this = this;
    _events = _.extend({}, Backbone.Events);
    _triggers = {
      "test": function() {
        return alert("you triggered my trap");
      }
    };
    PC = player.PC;
    stage = board.getStage();
    _stageObj = {};
    _bitmap = [];
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
              var c;
              board.setPresetBackground("");
              dialog.destroy();
              PC.trigger("change:current_chunk");
              c = PC.get("current_chunk");
              board.addMarker(PC);
              mapper.renderChunk(_bitmap[c.y][c.x], stage);
              board.addState("BATTLE").removeState("WAITING").removeState("TRAVEL");
              battler.activateGrid();
              board.setMapSize(_stageObj.width * globals.map.width, _stageObj.height * globals.map.height);
              PC.marker.y = 500;
              PC.marker.x = 0;
              return PC.setCurrentSpace();
            }
          }
        }
      ]);
    };
    $.getJSON(globals.stage_dir + "stage1.json", function(json) {
      var chunk, f, i, j, map, _i, _j, _k, _ref, _ref1, _ref2;
      _stageObj = json;
      for (f = _i = 0, _ref = _stageObj.height; 0 <= _ref ? _i < _ref : _i > _ref; f = 0 <= _ref ? ++_i : --_i) {
        _bitmap[f] = [];
      }
      map = _stageObj.map;
      for (i = _j = 0, _ref1 = _stageObj.width; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        for (j = _k = 0, _ref2 = _stageObj.height; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; j = 0 <= _ref2 ? ++_k : --_k) {
          chunk = map[j][i];
          chunk.background_position = generateChunkSprite(chunk, j, i);
          if (!chunk.tiles) {
            chunk.tiles = mapcreator.getDefaultChunk();
          } else {
            _.each(chunk.tiles, function(row) {
              return _.each(row, function(tile) {
                if (tile.trigger) {
                  return tile.trigger = _triggers[tile.trigger];
                }
              });
            });
          }
          _bitmap[j][i] = mapper.loadChunk(chunk, j, i);
          _bitmap[j][i].background_position = chunk.background_position;
        }
      }
      return _events.trigger("doneloading");
    });
    return {
      getBackground: function() {
        return _stageObj.background;
      },
      getBitmap: function() {
        return _bitmap;
      },
      getPrecursor: function() {
        return _stageObj.map;
      },
      initialize: _initialize,
      events: _events
    };
  });

}).call(this);
