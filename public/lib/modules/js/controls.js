(function() {
  define(["utilities", "globals", "dialog", "npc", "mapper", "mapcreator", "battler", "menus", "player", "jquery"], function(ut, globals, dialog, NPC, mapper, mapcreator, battler, menus, player) {
    var PC, kc, keysdisabled, _activeplayer;
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
      BATTLE: 66,
      CLEAR: 67,
      DEFAULT: 68,
      EXPORTMAP: 69,
      GRID: 71,
      MAPCREATOR: 77,
      STATE: 83,
      ZOOMIN: 90,
      ZOOMOUT: 79
    };
    PC = player.PC;
    keysdisabled = false;
    _activeplayer = null;
    require(["board", "taskrunner"], function(board, taskrunner) {
      var $c, delegate, generalFns, stateFns,
        _this = this;
      $c = board.$canvas.focus();
      Number.prototype.isStateDependent = function() {
        return true;
      };
      generalFns = {
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
              return PC.moveUp();
            case kc["RIGHT"]:
              return PC.moveRight();
            case kc["DOWN"]:
              return PC.moveDown();
            case kc["LEFT"]:
              return PC.moveLeft();
            case kc['SPACE']:
              return menus.toggleMenu("battle");
          }
        },
        CUTSCENE: function(key) {},
        TRAVEL: function(key) {
          ut.c(PC);
          switch (key) {
            case kc["UP"]:
              return PC.moveUp();
            case kc["RIGHT"]:
              return PC.moveRight();
            case kc["DOWN"]:
              return PC.moveDown();
            case kc["LEFT"]:
              return PC.moveLeft();
            case kc['CLEAR']:
              return mapper.clearChunk(window.stage);
            case kc['BATTLE']:
              board.addState("battle");
              board.removeState("travel");
              return menus.closeAll();
            case kc['SPACE']:
              return menus.toggleMenu("travel");
            case kc['MAPCREATOR']:
              return mapcreator.toggleOverlay();
            case kc['EXPORTMAP']:
              return mapcreator.exportMap();
            case kc['DEFAULT']:
              return mapcreator.getDefaultChunk();
            case kc['ZOOMIN']:
              return board.zoomIn(1);
            case kc['ZOOMOUT']:
              return board.zoomOut(1);
            case kc['STATE']:
              return console.log(board.getState());
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
        MENUOPEN: function(key) {
          switch (key) {
            case kc['UP']:
              return menus.selectPrev();
            case kc['DOWN']:
              return menus.selectNext();
            case kc['ENTER']:
              return menus.activateMenuItem();
            case kc['ESCAPE']:
              return menus.closeAll();
          }
        },
        LOADING: function() {
          return false;
        }
      };
      delegate = function(key, state, e) {
        if (key.isStateDependent()) {
          if ($.isArray(state)) {
            _.each(state, function(ins) {
              return stateFns[ins](key);
            });
          } else {
            stateFns[state](key);
          }
        }
        if (_.has(generalFns, key)) {
          return generalFns[key](e);
        }
      };
      return $c.on("keydown", function(e) {
        var key;
        if (!keysdisabled) {
          return delegate(key = e.keyCode || e.which, board.getState(), e);
        }
      });
    });
    return {
      getKeysDisabled: function() {
        return _keysDisabled;
      },
      setKeysDisabled: function(status) {
        var _keysDisabled;
        _keysDisabled = status;
        return this;
      },
      getKeyMap: function() {
        return kc;
      }
    };
  });

}).call(this);
