(function() {
  define(["utilities", "board", "globals", "underscore", "jquery"], function(ut, board, globals) {
    var dialog, stage, states, textshadow;
    stage = board.getStage();
    states = globals.states;
    textshadow = globals.textshadow;
    dialog = {
      drawrate: 20,
      drawroutine: null,
      background: function() {
        var shape;
        shape = new createjs.Shape();
        return shape.graphics.beginFill("#000").drawRect(0, 0, 200, 100);
      },
      initialize: function(background) {
        return board.setState(states.DRAWING);
      },
      "default": {
        textstyles: {
          x: 20,
          y: 300,
          shadow: textshadow,
          maxWidth: 660,
          lineHeight: 22,
          lineWidth: 660
        },
        instant: false
      },
      draw: function(text, opts) {
        var i, index, visible,
          _this = this;
        opts = $.extend(true, this["default"], opts || {});
        if (opts.before) {
          opts.before.call(this);
        }
        i = 0;
        if (typeof text === "function") {
          text = text();
        }
        this.current_text = text = text.split(" ");
        visible = "";
        index = this.current_display_index = null;
        if (opts.instant) {
          this.finish(opts);
          return;
        }
        return this.drawroutine = setInterval(function() {
          var alltext;
          if (!text[i]) {
            clearInterval(_this.drawroutine);
            if (opts.after) {
              opts.after.call(_this);
            }
            return;
          }
          alltext = new createjs.Text(visible + " " + text[i], "16px Arial", "#fff");
          _.extend(alltext, opts.textstyles);
          stage.removeChildAt(index);
          stage.addChild(alltext);
          index = stage.getChildIndex(alltext);
          visible += " " + text[i];
          return i++;
        }, opts.speed || this.drawrate);
      },
      clear: function() {
        return stage.removeChildAt(this.current_display_index);
      },
      finish: function(opts) {
        var text;
        opts = $.extend(true, this["default"], opts || {});
        clearInterval(this.drawroutine);
        this.current_text = this.current_text.join(" ");
        text = new createjs.Text(this.current_text, "16px Arial", "#fff");
        _.extend(text, opts.textstyles);
        if (!opts.instant) {
          stage.removeChildAt(this.current_display_index);
        }
        stage.addChild(text);
        return board.setState(states.WAITING);
      },
      destroy: function() {
        this.remove();
        return board.setState(states.WAITING);
      },
      waitThen: function(callback, time, donestate) {
        callback || (callback = function() {});
        return setTimeout(function() {
          callback();
          if (donestate) {
            return board.setState(donestate);
          }
        }, time);
      },
      dialogSetHelper: function(set, i) {
        var blurb,
          _this = this;
        blurb = set[i];
        if (blurb == null) {
          return;
        }
        this.draw(blurb.text, blurb.options || {});
        this.clear();
        return this.waitThen(function() {
          return _this.dialogSetHelper(set, ++i);
        }, blurb.delay);
      },
      loadDialogSet: function(set) {
        ut.c("wrapper");
        if (!set.length) {
          return;
        }
        return this.dialogSetHelper(set, 0);
      }
    };
    return {
      initialize: function() {
        dialog.initialize();
        return this;
      },
      draw: function(text) {
        dialog.draw(text);
        return this;
      },
      clear: function() {
        dialog.clear();
        return this;
      },
      remove: function() {
        dialog.remove();
        return this;
      },
      finish: function() {
        dialog.finish();
        return this;
      },
      destroy: function() {
        dialog.destroy();
        return this;
      },
      waitThen: function(callback, time, donestate) {
        dialog.waitThen(callback, time);
        return this;
      },
      loadDialogSet: function(text) {
        return dialog.loadDialogSet(text);
      }
    };
  });

}).call(this);
