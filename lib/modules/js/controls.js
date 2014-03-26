(function() {
  define(["utilities", "globals", "dialog", "npc", "mapper", "battler", "menus", "player", "jquery"], function(ut, globals, dialog, NPC, mapper, battler, menus, player) {
    return require(["board", "taskrunner"], function(board, taskrunner) {
      var $c, PC, delegate, generalFns, kc, keysdisabled, stateFns, _activeplayer,
        _this = this;
      PC = player.PC;
      $c = board.$canvas.focus();
      keysdisabled = false;
      _activeplayer = null;
      kc = {
        ENTER: 13,
        SPACE: 32,
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        ESCAPE: 27,
        NEW: 78,
        COMMAND: 91,
        CLEAR: 67,
        BATTLE: 66,
        GRID: 71
      };
      Number.prototype.isStateDependent = function() {
        return true;
      };
      generalFns = {
        91: function(e) {},
        71: board.toggleGrid
      };
      stateFns = {
        INTRO: function(key) {
          switch (key) {
            case kc["NEW"]:
              return taskrunner.newGame();
          }
        },
        WAITING: function(key) {},
        BATTLE: function(key) {
          _activeplayer = battler.getActivePlayer();
          ut.c(_activeplayer);
          switch (key) {
            case kc["UP"]:
              return PC.move(0, -1);
            case kc["RIGHT"]:
              ut.c("right");
              return PC.move(1, 0);
            case kc["DOWN"]:
              ut.c("down");
              return PC.move(0, 1);
            case kc["LEFT"]:
              ut.c("left");
              return PC.move(-1, 0);
            case kc['SPACE']:
              return menus.launchMenu();
          }
        },
        CUTSCENE: function(key) {},
        TRAVEL: function(key) {
          ut.c(PC);
          switch (key) {
            case kc["UP"]:
              ut.c("UP");
              return PC.move(0, -1);
            case kc["RIGHT"]:
              ut.c("right");
              return PC.move(1, 0);
            case kc["DOWN"]:
              ut.c("down");
              return PC.move(0, 1);
            case kc["LEFT"]:
              ut.c("left");
              return PC.move(-1, 0);
            case kc['CLEAR']:
              return mapper.clearChunk(window.stage);
            case kc['BATTLE']:
              return board.addState("battle");
            case kc['SPACE']:
              menus.launchMenu();
              return ut.c('launching travel menu');
          }
        },
        DRAWING: function(key) {
          switch (key) {
            case kc["ENTER"]:
            case kc["SPACE"]:
              ut.c("finish dialog");
              return dialog.finish();
            case kc['ESCAPE']:
              return dialog.clear();
          }
        },
        LOADING: function() {
          return false;
        }
      };
      delegate = function(key, state, e) {
        ut.c(key);
        if (key.isStateDependent()) {
          if ($.isArray(state)) {
            _.each(state, function(ins) {
              return stateFns[ins](key);
            });
          } else {
            stateFns[state](key);
          }
        }
        if (generalFns.hasOwnProperty(key)) {
          return generalFns[key](e);
        }
      };
      $c.on("keydown", function(e) {
        var key;
        if (!keysdisabled) {
          return delegate(key = e.keyCode || e.which, board.getState(), e);
        }
      });
      return {
        getKeysDisabled: function() {
          return keysDisabled;
        },
        setKeysDisabled: function(status) {
          var keysDisabled;
          keysDisabled = status;
          return this;
        }
      };
    });
  });

}).call(this);
