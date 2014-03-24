(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["utilities", "board", "underscore", "backbone"], function(ut, board) {
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

      NPC.prototype.move = function(x, y) {
        var sheet;
        if (!this.stage || !this.marker) {
          return this;
        }
        this.marker.x += 50 * x;
        this.marker.y += 50 * y;
        sheet = this.marker.spriteSheet = this.sheets[x + "," + y];
        sheet.getAnimation("run").speed = .13;
        sheet.getAnimation("run").next = "run";
        return {
          x: this.marker.x,
          y: this.marker.y
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
