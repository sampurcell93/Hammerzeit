(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "board", "mapper", "underscore", "backbone"], function(globals, ut, board, mapper) {
    var NPC, coordToDir, _checkEntry, _p, _ref, _ts;
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
    _p = {
      walkopts: {
        framerate: 30,
        animations: {
          run: [0, 3]
        },
        images: ["images/sprites/hero.png"]
      },
      walkspeed: 9
    };
    _ts = globals.map.tileside;
    NPC = (function(_super) {
      __extends(NPC, _super);

      function NPC() {
        _ref = NPC.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      NPC.prototype.currentspace = {};

      NPC.prototype.move_callbacks = {
        done: function() {},
        change: function() {}
      };

      NPC.prototype.moving = {
        x: false,
        y: false
      };

      NPC.prototype.setChunk = function(y, x) {
        var chunk;
        chunk = this.get("current_chunk");
        chunk.x = x;
        chunk.y = y;
        this.set("current_chunk", chunk, {
          silent: true
        });
        this.trigger("change:current_chunk");
        return this;
      };

      NPC.prototype.checkElevation = function(target) {
        return !(Math.abs(this.currentspace.elv - target.elv) > this.get("attrs").jmp);
      };

      NPC.prototype.checkEnterable = function(target, dx, dy) {
        ut.c("checking enter at " + dx + "," + dy);
        try {
          if (!this.checkElevation(target)) {
            ut.c("failed elevation check");
            ut.c(target);
            return false;
          }
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

      NPC.prototype.getTargetTile = function(dx, dy, prev) {
        var chunk, x, y, _ref1;
        chunk = mapper.getVisibleChunk().children;
        y = prev ? prev.y : this.marker.y;
        x = prev ? prev.x : this.marker.x;
        if (prev) {
          ut.c("checking new target at " + x + "," + y);
        }
        return ((_ref1 = chunk[(y + (50 * dy)) / 50]) != null ? _ref1.children[(x + (50 * dx)) / 50] : void 0) || {};
      };

      NPC.prototype.checkTrigger = function(target) {
        if (target.trigger != null) {
          return setTimeout(triggers[target.trigger], 15);
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

      NPC.prototype.reanimate = function(animation, speed, next) {
        var sheet;
        sheet = this.marker.spriteSheet;
        sheet.getAnimation(animation || "run").speed = speed;
        return sheet.getAnimation(animation || "run").next = next;
      };

      NPC.prototype.roundToNearestTile = function(x, y, dx, dy) {
        return {
          x: Math.ceil(x / _ts) * _ts,
          y: Math.ceil(y / _ts) * _ts
        };
      };

      NPC.prototype.deltaToString = function(dx, dy) {
        if (dx !== 0) {
          return "x";
        } else if (dy !== 0) {
          return "y";
        } else {
          return "";
        }
      };

      NPC.prototype.oppositeDir = function(dir) {
        if (dir === "x") {
          return "y";
        } else if (dir === "y") {
          return "x";
        } else {
          return "";
        }
      };

      NPC.prototype.move = function(dx, dy) {
        var cbs, count, dir, m_i, marker, other_dir, sheet, target,
          _this = this;
        if (board.getPaused()) {
          return true;
        }
        cbs = this.move_callbacks;
        marker = this.marker;
        this.previous_position = this.roundToNearestTile(marker.x, marker.y, dx, dy);
        target = this.getTargetTile(dx, dy);
        sheet = this.setSpriteSheet(dx, dy);
        dir = this.deltaToString(dx, dy);
        other_dir = this.oppositeDir(dir);
        if (this.moving[dir] === true) {
          return false;
        }
        ut.c("dir is " + dir);
        ut.c("other dir is " + other_dir);
        if (!this.stage || !marker) {
          throw new Error("There is no stage or marker assigned to this NPC!");
        }
        count = 0;
        ut.c("SETTING " + dir + " TO TRUE");
        this.moving[dir] = true;
        m_i = setInterval(function() {
          if (count < 10) {
            marker.x += 5 * dx;
            marker.y += 5 * dy;
            cbs.change.call(_this, dx, dy);
          } else {
            clearInterval(m_i);
            _this.moving[dir] = false;
            marker = _.extend(marker, _this.roundToNearestTile(marker.x, marker.y, dx, dy));
            _this.checkTrigger(target);
            _this.leaveSquare();
            _this.enterSquare(target);
            _this.reanimate("run", .13, "run");
            cbs.done.call(_this, dx, dy);
          }
          return count++;
        }, _p.walkspeed);
        console.log(this.moving);
        if (this.moving[other_dir] === true) {
          ut.c("checking new target based on previous position");
          if (other_dir === "y") {
            this.previous_position.y += _ts;
          } else if (other_dir === "x") {
            this.previous_position.x += _ts;
          }
          ut.c(this.previous_position);
          target = this.getTargetTile(dx, dy, this.previous_position);
          ut.c("found at" + target.x + "," + target.y);
        }
        if (!this.checkEnterable(target, dx, dy)) {
          ut.c("encountered a bad move:");
          ut.c("previous_position: ", this.previous_position);
          ut.c("vector was (x,y): ", dx, dy);
          clearInterval(m_i);
          _.extend(marker, this.previous_position);
          return this.moving[dir] = false;
        } else {
          ut.c("enterable at" + target.x / 50 + "," + target.y / 50);
        }
        return true;
      };

      NPC.prototype.defaults = function() {
        return {
          name: "NPC",
          inventory: [],
          type: 'NPC',
          sprite: null,
          level: 1,
          HP: 10,
          attrs: {
            spd: 6,
            ac: 10,
            jmp: 2,
            atk: 3
          },
          current_chunk: {
            x: 0,
            y: 0
          }
        };
      };

      NPC.prototype.getPrivate = function(id) {
        return _p[id];
      };

      return NPC;

    })(Backbone.Model);
    return window.NPC = NPC;
  });

}).call(this);
