(function() {
  define(["battler", "mapcreator", "utilities", "board", "dialog", "globals", "taskrunner", "player", "mapper", "controls", "underscore", "jquery"], function(battler, mapcreator, ut, board, dialog, globals, runner, player, mapper, controls) {
    var PC, generateBackgroundPosition, initialize, stage, _bitmap, _events, _raw_map, _stageObj, _triggers,
      _this = this;
    _events = _.extend({}, Backbone.Events);
    _triggers = {
      "test": function() {
        return alert("you triggered my trap");
      }
    };
    PC = taskrunner.getPC();
    stage = board.getStage();
    _stageObj = {};
    _bitmap = [];
    _raw_map = null;
    generateBackgroundPosition = function(i, j) {
      var str;
      str = "-" + globals.map.width * i + "px ";
      str += "-" + globals.map.height * j + "px";
      return str;
    };
    initialize = function() {
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
              PC.changeChunk();
              board.setPresetBackground("");
              dialog.destroy();
              board.addMarker(PC);
              board.addState("TRAVEL").removeState("WAITING");
              return PC.enterSquare();
            }
          }
        }
      ]);
    };
    $.getJSON(globals.stage_dir + "stage1.json", function(json) {
      var height, width;
      _stageObj = json;
      console.log(_stageObj);
      _raw_map = _stageObj.map;
      height = _stageObj.height;
      width = _stageObj.width;
      _.each(_raw_map, function(chunk_row, i) {
        return _.each(chunk_row, function(chunk, j) {
          if (chunk.background_position === true) {
            chunk.background_position = generateBackgroundPosition(j, i);
            console.log(chunk.background_position);
          }
          if (_.isUndefined(chunk.tiles)) {
            return chunk.tiles = mapper.getEmptyMap();
          }
        });
      });
      _events.trigger("loading:done");
      return initialize();
    });
    return {
      getBackground: function() {
        return _stageObj.background;
      },
      getPrecursor: function() {
        return _stageObj.map;
      },
      events: _events
    };
  });

}).call(this);
