(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "battler", "board", "player", "controls", "mapper", "mapcreator", "menus"], function(globals, ut, battler, board, player, controls, mapper, mapcreator, menus) {
    var SignUp, taskrunner, _ref;
    window.PC = player.PC;
    SignUp = (function(_super) {
      __extends(SignUp, _super);

      function SignUp() {
        _ref = SignUp.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      SignUp.prototype.template = $("#new-game").html();

      SignUp.prototype.render = function() {
        this.$el.html(_.template(this.template));
        return this;
      };

      SignUp.prototype.events = function() {
        return {
          "click": function() {}
        };
      };

      return SignUp;

    })(Backbone.View);
    taskrunner = {
      newGame: function() {
        return this.loadStage(1);
      },
      loadStage: function(module) {
        board.addState("LOADING");
        return require(["lib/modules/js/stage" + module], function(level) {
          board.removeState("LOADING");
          return PC.on("change:current_chunk", function() {
            var full_chunk, newchunk;
            ut.c("CHUNK CHANGE REGISTERED IN TASKRUNNER");
            newchunk = PC.get("current_chunk");
            board.setBackground(level.getBackground());
            mapcreator.loadChunk(level.getBitmap()[newchunk.y][newchunk.x], newchunk.x, newchunk.y);
            mapcreator.render();
            full_chunk = level.getBitmap()[newchunk.y][newchunk.x];
            mapper.renderChunk(full_chunk, board.getStage());
            return battler.clearPotentialMoves();
          });
        });
      }
    };
    globals.shared_events.on("newgame", function() {
      return taskrunner.newGame();
    });
    return taskrunner;
  });

}).call(this);
