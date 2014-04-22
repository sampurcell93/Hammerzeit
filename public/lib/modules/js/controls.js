(function() {
  define(["board", "taskrunner", "utilities", "globals", "dialog", "npc", "mapper", "mapcreator", "battler", "menus", "player", "jquery"], function(board, taskrunner, ut, globals, dialog, NPC, mapper, mapcreator, battler, menus, player) {
    var $c, PC, delegate, generalFns, kc, keysdisabled, stateFns, _priority_queue,
      _this = this;
    _priority_queue = ["CUTSCENE", "MENUOPEN", "DIALOG", "BATTLE", "TRAVEL", "INTRO", "WAITING", "DRAWING", "LOADING"];
    kc = {
      ENTER: 13,
      SPACE: 32,
      UP: 38,
      DOWN: 40,
      LEFT: 37,
      RIGHT: 39,
      ESCAPE: 27,
      NEW: 78,
      LOADGAME: 76,
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
    $c = board.$canvas.focus();
    Number.prototype.isStateDependent = function() {
      return true;
    };
    generalFns = {
      71: battler.toggleGrid,
      77: mapcreator.toggleOverlay,
      69: mapcreator.exportMap
    };
    stateFns = {
      INTRO: function(key) {
        switch (key) {
          case kc["NEW"]:
            return taskrunner.newGame();
          case kc["LOADGAME"]:
            return taskrunner.loadGame();
        }
      },
      WAITING: function(key) {},
      BATTLE: function(key) {
        var activeplayer;
        activeplayer = battler.getActive({
          player: true
        });
        if (activeplayer != null) {
          switch (key) {
            case kc["UP"]:
              return activeplayer.moveUp();
            case kc["RIGHT"]:
              return activeplayer.moveRight();
            case kc["DOWN"]:
              return activeplayer.moveDown();
            case kc["LEFT"]:
              return activeplayer.moveLeft();
            case kc['SPACE']:
              return menus.toggleMenu();
          }
        } else {
          console.log("you can't go now: a player character is NOT active. The active player is ");
          return console.log(battler.getActive());
        }
      },
      CUTSCENE: function(key) {},
      TRAVEL: function(key) {
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
            board.addState("battle").removeState("travel");
            return menus.closeAll();
          case kc['SPACE']:
            return menus.toggleMenu("travel");
          case kc['DEFAULT']:
            return ut.launchModal(JSON.stringify(mapcreator.getDefaultChunk()));
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
      var queue;
      queue = [];
      if (key.isStateDependent()) {
        if ($.isArray(state)) {
          _.each(state, function(ins) {
            stateFns[ins].state = ins;
            return queue[_priority_queue.indexOf(ins)] = stateFns[ins];
          });
          _.each(queue, function(fn) {
            if (fn) {
              return fn(key);
            }
          });
        } else {
          stateFns[state](key);
        }
      }
      if (_.has(generalFns, key)) {
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
