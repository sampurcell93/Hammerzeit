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
        NEW: 78
      };
      Number.prototype.isStateDependent = function() {
        return true;
      };
      generalFns = {
        13: function() {}
      };
      stateFns = {
        0: function(key) {
          switch (key) {
            case kc["NEW"]:
              return board.newGame();
          }
        },
        1: function(key) {},
        2: function(key) {},
        3: function(key) {},
        4: function(key) {},
        5: function(key) {
          switch (key) {
            case kc["ENTER"]:
            case kc["SPACE"]:
              ut.c("finish dialog");
              return dialog.finish();
            case kc['ESCAPE']:
              return dialog.clear();
          }
        }
      };
      delegate = function(key, state) {
        if (key.isStateDependent()) {
          return stateFns[state](key);
        } else if (generalFns.hasOwnProperty(key)) {
          return generalFns[key]();
        }
      };
      return $c.on("keydown", function(e) {
        var key;
        if (!board.getKeysDisabled()) {
          return delegate(key = e.keyCode || e.which, board.getState());
        }
      });
    });
  });

}).call(this);
