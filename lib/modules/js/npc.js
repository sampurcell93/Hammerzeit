(function() {
  define("npc", ["utilities", "underscore", "backbone"], function(ut) {
    var NPC, move_fns;
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
        ut.c(count, dir, this.movingIntervals);
        if (count >= 9) {
          _.each(this.movingIntervals, function(i, key) {
            if (dir === key) {
              return clearInterval(i);
            }
          });
          this.moving = false;
          return count + 1;
        } else {
          return count + 1;
        }
      },
      dirToCoords: function(dir) {
        var dirs;
        dirs = {
          "left": "x",
          "right": "x",
          "up": "y",
          "down": "Y"
        };
        return dirs[dir];
      },
      checkDiagonalMove: function(marker, dir) {
        var secondarymove;
        secondarymove = this.secondarymove;
        if ((dir === "x" && secondarymove === "y") || (dir === "y" && secondarymove === "x")) {
          this.secondarymove = null;
          return this["move" + dir](marker, this.dirToCoords(dir));
        }
      },
      moveright: function(marker, dir) {
        var count,
          _this = this;
        count = 0;
        if (!(marker.x >= 650)) {
          this.movingIntervals[dir] = setInterval(function() {
            _this.moveMarker(marker, dir);
            count = _this.stopWhenMoved(count, dir);
            return _this.checkDiagonalMove(marker, dir);
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
            count = _this.stopWhenMoved(count, dir);
            return _this.checkDiagonalMove(marker, dir);
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
            count = _this.stopWhenMoved(count, dir);
            return _this.checkDiagonalMove(marker, dir);
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
            count = _this.stopWhenMoved(count, dir);
            return _this.checkDiagonalMove(marker, dir);
          }, this.walkSpeed);
          return "down";
        }
        return false;
      }
    };
    NPC = Backbone.Model.extend({
      move: function(dir) {
        var coords, fulldir, sheet;
        if (!this.stage || !this.marker) {
          return this;
        }
        if (this.moving) {
          move_fns['secondarymove'] = dir;
        }
        fulldir = "move" + dir;
        coords = {
          left: "x",
          right: "x",
          up: "y",
          down: "y"
        };
        this.sheet = sheet = move_fns[fulldir](this.marker, coords[dir]);
        if (sheet) {
          this.moving = true;
          sheet = this.marker.spriteSheet = this.sheets[sheet];
          sheet.getAnimation("run").speed = .13;
          sheet.getAnimation("run").next = "run";
        }
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
