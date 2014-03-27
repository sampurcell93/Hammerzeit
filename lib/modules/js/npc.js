(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "board", "mapper", "underscore", "backbone"], function(globals, ut, board, mapper) {
    var NPC, coordToDir, privates, _checkEntry, _ref;
    _checkEntry = ut.tileEntryCheckers;
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

      NPC.prototype.currentspace = {};

      NPC.prototype.setChunk = function(y, x) {
        var chunk;
        chunk = this.get("current_chunk");
        chunk.x = x;
        chunk.y = y;
        this.set("current_chunk", chunk, {
          siltnt: true
        });
        this.trigger("change:current_chunk");
        return this;
      };

      NPC.prototype.checkElevation = function(target) {
        if (Math.abs(this.currentspace.elv - target.elv) > this.get("attrs").jmp) {
          return false;
        } else {
          return true;
        }
      };

      NPC.prototype.checkEnterable = function(target, dx, dy) {
        var elevation;
        try {
          elevation = this.checkElevation(target);
          if (target.e != null) {
            if (target.e === false || target.e === "f") {
              return false;
            } else if (typeof target.e === "string") {
              return _checkEntry[target.e](dx, dy);
            } else {
              return true;
            }
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
          return setTimeout(target.trigger, 15);
        } else {
          return null;
        }
      };

      NPC.prototype.canMoveOffChunk = function(x, y) {
        return !board.hasState("battle") && (x < globals.map.width || y < globals.map.height);
      };

      NPC.prototype.setSpriteSheet = function(dx, dy) {
        return this.marker.spriteSheet = this.sheets[ut.floorToOne(dx) + "," + ut.floorToOne(dy)];
      };

      NPC.prototype.leaveSquare = function() {
        this.currentspace.occupied = false;
        this.currentspace.occupiedBy = null;
        return this;
      };

      NPC.prototype.enterSquare = function(target) {
        this.currentspace = target;
        target.occupied = true;
        return target.occupiedBy = this.marker;
      };

      NPC.prototype.moveRight = function() {
        return this.move(1, 0);
      };

      NPC.prototype.moveLeft = function() {
        return this.move(-1, 0);
      };

      NPC.prototype.moveUp = function() {
        return this.move(0, -1);
      };

      NPC.prototype.moveDown = function() {
        return this.move(0, 1);
      };

      NPC.prototype.move = function(dx, dy, done) {
        var count, m_i, marker, prev, sheet, target,
          _this = this;
        marker = this.marker;
        target = this.getTargetTile(dx, dy);
        prev = {
          x: marker.x,
          y: marker.y
        };
        if (!this.stage || !marker) {
          return false;
        }
        sheet = this.setSpriteSheet();
        if (!this.checkEnterable(target, dx, dy)) {
          return false;
        }
        count = 0;
        m_i = setInterval(function() {
          if (count === 1) {
            _this.moving = true;
          } else if (count <= 10) {
            marker.x += 5 * dx;
            marker.y += 5 * dy;
          } else {
            clearInterval(m_i);
            _this.moving = false;
            if ((done != null) && typeof done === "function") {
              done(dx, dy);
            }
          }
          return count++;
        }, 5);
        console.log("checking canMoveOffChunk");
        if (!this.canMoveOffChunk(marker.x + dx * 50, marker.y + dy * 50)) {
          return false;
        }
        this.checkTrigger(target);
        this.leaveSquare();
        this.enterSquare(target);
        sheet.getAnimation("run").speed = .13;
        sheet.getAnimation("run").next = "run";
        return {
          x: marker.x,
          y: marker.y
        };
      };

      NPC.prototype.defaults = function() {
        return {
          name: "NPC",
          inventory: [],
          type: 'NPC',
          sprite: null,
          level: 1,
          attrs: {
            spd: 6,
            ac: 10,
            jmp: 1,
            atk: 3
          },
          current_chunk: {
            x: 0,
            y: 0
          }
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
