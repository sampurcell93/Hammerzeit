(function() {
  define(["jquery", "underscore"], function() {
    var b, bl, destroyModal, l, launchModal, r, rb, rbl, rl, t, tb, tbl, tl, tr, trb, trl;
    window.onbeforeunload = function(event) {
      var s;
      s = "You have unsaved changes. Really leave?";
      event = event || window.event;
      if (event) {
        event.returnValue = s;
      }
      return s;
    };
    if (typeof Object.create !== "function") {
      Object.create = function(o) {
        var F;
        F = function() {};
        F.prototype = o;
        return new F();
      };
    }
    launchModal = function(content, options) {
      var defaults, modal;
      destroyModal(true);
      defaults = {
        close: true,
        destroyHash: false
      };
      options = $.extend(defaults, options);
      modal = $("<div />").addClass("modal");
      try {
        if ($.isArray(content)) {
          $.each(content, function(index, item) {
            return modal.append(item);
          });
        } else {
          modal.html(content);
        }
      } catch (_error) {}
      if (options.close !== false) {
        modal.prepend("<i class='close-modal'>X</i>");
        modal.find(".close-modal").on("click", function() {
          return destroyModal(null, options);
        });
        modal.on("keyup", function(e) {
          var key;
          key = e.keyCode || e.which;
          if (key === 27) {
            return destroyModal();
          }
        });
      }
      $(document.body).addClass("active-modal").append(modal);
      return modal;
    };
    destroyModal = function(existing, options) {
      options = $.extend({
        destroyHash: false
      }, options);
      $(".modal").remove();
      $(document.body).removeClass("active-modal");
      return $("#game-board").focus();
    };
    l = function(x, y) {
      return x > 0;
    };
    r = function(x, y) {
      return x < 0;
    };
    t = function(x, y) {
      return y > 0;
    };
    b = function(x, y) {
      return y < 0;
    };
    rl = function(x, y) {
      return l(x, y) || r(x, y);
    };
    tl = function(x, y) {
      return l(x, y) || t(x, y);
    };
    bl = function(x, y) {
      return l(x, y) || b(x, y);
    };
    trl = function(x, y) {
      return tr(x, y) || l(x, y);
    };
    tbl = function(x, y) {
      return bl(x, y) || t(x, y);
    };
    rbl = function(x, y) {
      return l(x, y) || rb(x, y);
    };
    tr = function(x, y) {
      return r(x, y) || t(x, y);
    };
    rb = function(x, y) {
      return r(x, y) || b(x, y);
    };
    trb = function(x, y) {
      return tr(x, y) || b(x, y);
    };
    tb = function(x, y) {
      return b(x, y) || t(x, y);
    };
    return {
      c: function() {
        var arg, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
          arg = arguments[_i];
          _results.push(console.log(arg));
        }
        return _results;
      },
      create: Object.create,
      addEventListeners: function(obj, events) {
        return _.each(events, function(fn, name) {
          return obj.addEventListener(name, fn);
        });
      },
      underline: function(ctx, text, x, y, size, color, thickness, offset) {
        var width;
        width = ctx.measureText(text).width;
        switch (ctx.textAlign) {
          case "center":
            x -= width / 2;
            break;
          case "right":
            x -= width;
        }
        y += size + (offset || 1);
        ctx.beginPath();
        ctx.strokeStyle = color || "#fff";
        ctx.lineWidth = thickness || 2;
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        return ctx.stroke();
      },
      launchModal: function(content, options) {
        return launchModal(content, options);
      },
      destroyModal: function(existing, options) {
        return destroyModal(existing, options);
      },
      tileEntryCheckers: {
        l: function(x, y) {
          return x > 0;
        },
        r: function(x, y) {
          return x < 0;
        },
        t: function(x, y) {
          return y > 0;
        },
        b: function(x, y) {
          return y < 0;
        },
        rl: function(x, y) {
          return l(x, y) || r(x, y);
        },
        tl: function(x, y) {
          return l(x, y) || t(x, y);
        },
        bl: function(x, y) {
          return l(x, y) || b(x, y);
        },
        trl: function(x, y) {
          return tr(x, y) || l(x, y);
        },
        tbl: function(x, y) {
          return bl(x, y) || t(x, y);
        },
        rbl: function(x, y) {
          return l(x, y) || rb(x, y);
        },
        tr: function(x, y) {
          return r(x, y) || t(x, y);
        },
        rb: function(x, y) {
          return r(x, y) || b(x, y);
        },
        trb: function(x, y) {
          return tr(x, y) || b(x, y);
        },
        tb: function(x, y) {
          return b(x, y) || t(x, y);
        }
      },
      floorToOne: function(val) {
        if (val < 0) {
          return -1;
        } else if (val > 0) {
          return 1;
        } else {
          return 0;
        }
      }
    };
  });

}).call(this);
