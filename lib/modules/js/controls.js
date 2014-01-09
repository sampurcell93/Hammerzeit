(function() {
  define(["utilities", "dialog", "jquery"], function(ut, dialog) {
    return require(["board"], function(board) {
      var $c, delegate, generalFns, kc, stateFns,
        _this = this;
      $c = board.$canvas.focus();
      kc = {
        ENTER: 13,
        SPACE: 32,
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        ESCAPE: 27,
        NEW: 78,
        COMMAND: 91
      };
      Number.prototype.isStateDependent = function() {
        return true;
      };
      generalFns = {
        91: function(e) {}
      };
      stateFns = {
        INTRO: function(key) {
          switch (key) {
            case kc["NEW"]:
              return board.newGame();
          }
        },
        WAITING: function(key) {},
        BATTLE: function(key) {},
        CUTSCENE: function(key) {},
        TRAVEL: function(key) {
          switch (key) {
            case kc["DOWN"]:
              return ut.c("moving down bro");
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
        if (key.isStateDependent()) {
          if ($.isArray(state)) {
            return _.each(state, function(ins) {
              return stateFns[ins](key);
            });
          } else {
            return stateFns[state](key);
          }
        } else if (generalFns.hasOwnProperty(key)) {
          return generalFns[key](e);
        }
      };
      return $c.on("keydown", function(e) {
        var key;
        if (!board.getKeysDisabled()) {
          return delegate(key = e.keyCode || e.which, board.getState(), e);
        }
      });
    });
  });

}).call(this);
