(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["utilities", "board", "mapper", "underscore", "backbone"], function(ut, board, mapper) {
    var NPC, coordToDir, privates, _ref;
    coordToDir = function(coord, orientation) {
      orientation || (orientation = "1");
      orientation = orientation.toString();
      return {
        "-1x": "left",
        "1x": "right",
        "-1y": "up",
        "1y": "down"
      }[orientation + coord];
    };
    privates = {
      walkopts: {
        framerate: 30,
        animations: {
          run: [0, 3]
        },
        images: ["images/sprites/hero.png"]
      }
    };
    NPC = (function(_super) {
      __extends(NPC, _super);

      function NPC() {
        _ref = NPC.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      NPC.prototype.defaults = {
        current_chunk: {
          x: 0,
          y: 0
        }
      };

      NPC.prototype.checkEnterable = function(target) {
        try {
          if (target.enter === false) {
            return false;
          } else {
            return true;
          }
        } catch (_error) {
          return true;
        }
      };

      NPC.prototype.getTargetTile = function(dx, dy) {
        var chunk, _ref1;
        chunk = mapper.getVisibleChunk().children;
        return ((_ref1 = chunk[(this.marker.y + (50 * dy)) / 50]) != null ? _ref1.children[(this.marker.x + (50 * dx)) / 50] : void 0) || {};
      };

      NPC.prototype.checkTrigger = function(target) {
        if (typeof target.trigger === "function") {
          return target.trigger();
        } else {
          return null;
        }
      };

      NPC.prototype.move = function(dx, dy) {
        var marker, prev, sheet, target;
        marker = this.marker;
        target = this.getTargetTile(dx, dy);
        prev = {
          x: marker.x,
          y: marker.y
        };
        if (!this.stage || !marker) {
          return false;
        }
        sheet = marker.spriteSheet = this.sheets[dx + "," + dy];
        if (!this.checkEnterable(target)) {
          return false;
        }
        marker.x += 50 * dx;
        marker.y += 50 * dy;
        this.checkTrigger(target);
        sheet.getAnimation("run").speed = .13;
        sheet.getAnimation("run").next = "run";
        ut.c({
          x: marker.x,
          y: marker.y
        });
        return {
          x: marker.x,
          y: marker.y
        };
      };

      NPC.prototype.defaults = function() {
        return {
          name: "NPC",
          items: [],
          sprite: null
        };
      };

      NPC.prototype.getPrivate = function(id) {
        return privates[id];
      };

      return NPC;

    })(Backbone.Model);
    return NPC;
  });

}).call(this);
