(function() {
  define(["utilities", "board", "underscore", "backbone"], function(ut, board) {
    var NPC, coordToDir, move_fns;
    ut.c(board);
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
    move_fns = {
      movingIntervals: {},
      secondarymove: null,
      walkSpeed: 20,
      walkopts: {
        framerate: 30,
        animations: {
          run: [0, 3]
        },
        images: ["images/sprites/hero.png"]
      },
      moveMarker: function(marker, dir, offset) {
        return marker[dir] += 5 * (offset || 1);
      },
      stopWhenMoved: function(count, dir) {
        if (count >= 9) {
          clearInterval(this.movingIntervals[dir]);
          return count + 1;
        } else {
          return count + 1;
        }
      },
      moveright: function(marker, dir) {
        var count,
          _this = this;
        count = 0;
        if (!(marker.x >= 650)) {
          this.movingIntervals[dir] = setInterval(function() {
            _this.moveMarker(marker, dir);
            return count = _this.stopWhenMoved(count, dir);
          }, this.walkSpeed);
          return "right";
        }
        return false;
      },
      moveleft: function(marker, dir) {
        var count,
          _this = this;
        count = 0;
        if (!(marker.x <= 0)) {
          this.movingIntervals[dir] = setInterval(function() {
            _this.moveMarker(marker, dir, -1);
            return count = _this.stopWhenMoved(count, dir);
          }, this.walkSpeed);
          return "left";
        }
        return false;
      },
      moveup: function(marker, dir) {
        var count,
          _this = this;
        count = 0;
        if (!(marker.y <= 0)) {
          this.movingIntervals[dir] = setInterval(function() {
            _this.moveMarker(marker, dir, -1);
            return count = _this.stopWhenMoved(count, dir);
          }, this.walkSpeed);
          return "up";
        }
        return false;
      },
      movedown: function(marker, dir) {
        var count,
          _this = this;
        count = 0;
        if (!(marker.y >= 650)) {
          this.movingIntervals[dir] = setInterval(function() {
            _this.moveMarker(marker, dir);
            return count = _this.stopWhenMoved(count, dir);
          }, this.walkSpeed);
          return "down";
        }
        return false;
      }
    };
    NPC = Backbone.Model.extend({
      move: function(x, y) {
        var _this = this;
        if (!this.stage || !this.marker) {
          return this;
        }
        board.moveObjectTo(this, this.marker.x + x, this.marker.y + y, {
          done: function() {
            var sheet;
            if (sheet) {
              sheet = _this.marker.spriteSheet = _this.sheets[sheet];
              sheet.getAnimation("run").speed = .13;
              return sheet.getAnimation("run").next = "run";
            }
          }
        });
        return this;
      },
      defaults: function() {
        return {
          name: "NPC",
          items: [],
          sprite: null
        };
      },
      frames: {
        left: null,
        right: null,
        up: null,
        down: null
      },
      getPrivate: function(id) {
        return move_fns[id];
      }
    });
    _.each(move_fns, function(fn) {
      if (typeof fn === "function") {
        return _.bind(fn, NPC);
      }
    });
    return NPC;
  });

}).call(this);
