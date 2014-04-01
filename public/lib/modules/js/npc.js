(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "board", "items", "mapper", "underscore", "backbone"], function(globals, ut, board, items, mapper) {
    var CharacterArray, NPC, Row, coordToDir, _checkEntry, _p, _ref, _ref1, _ts;
    _checkEntry = ut.tileEntryCheckers;
    _ts = globals.map.tileside;
    Row = mapper.Row;
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

      NPC.prototype.frames = {
        down: [[0, 0, 55, 55, 0], [55, 0, 55, 55, 0], [110, 0, 55, 55, 0], [165, 0, 55, 55, 0]],
        left: [[0, 55, 55, 55, 0], [55, 55, 55, 55, 0], [110, 55, 55, 55, 0], [165, 55, 55, 55, 0]],
        right: [[0, 110, 55, 55, 0], [55, 110, 55, 55, 0], [110, 110, 55, 55, 0], [165, 110, 55, 55, 0]],
        up: [[0, 165, 55, 55, 0], [55, 165, 55, 55, 0], [110, 165, 55, 55, 0], [165, 165, 55, 55, 0]]
      };

      NPC.prototype.initialize = function() {
        var sheet, sprite;
        _.bind(this.move_callbacks.done, this);
        _.bind(this.move_callbacks.change, this);
        this.walkopts = _.extend(this.getPrivate("walkopts"), {
          images: ["images/sprites/hero.png"]
        });
        this.sheets = {
          "-1,0": new createjs.SpriteSheet(_.extend(this.walkopts, {
            frames: this.frames.left
          })),
          "1,0": new createjs.SpriteSheet(_.extend(this.walkopts, {
            frames: this.frames.right
          })),
          "0,-1": new createjs.SpriteSheet(_.extend(this.walkopts, {
            frames: this.frames.up
          })),
          "0,1": new createjs.SpriteSheet(_.extend(this.walkopts, {
            frames: this.frames.down
          }))
        };
        sheet = this.sheets["0,1"];
        sheet.getAnimation("run").speed = .13;
        sheet.getAnimation("run").next = "run";
        sprite = new createjs.Sprite(sheet, "run");
        return this.marker = sprite;
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

      NPC.prototype.checkElevation = function(target, start) {
        start || (start = this.currentspace);
        return !(Math.abs(start.elv - target.elv) > this.get("attrs").jmp);
      };

      NPC.prototype.checkEnterable = function(target, dx, dy, start) {
        try {
          if (!this.checkElevation(target, start)) {
            return false;
          }
          if (target.e != null) {
            if (target.e === false || target.e === "f") {
              return false;
            } else if (target.occupied === true) {
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

      NPC.prototype.checkTrigger = function(target) {
        if (target.trigger != null) {
          return setTimeout(function() {
            var result;
            result = target.trigger();
            if (result !== false) {
              return target.trigger = null;
            }
          }, 0);
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

      NPC.prototype.enterSquare = function(target, dx, dy) {
        this.currentspace = target;
        target.occupied = true;
        target.occupiedBy = this.marker;
        if (target.end === false || target.end === "false" && (dx !== 0 && dy !== 0)) {
          return this.move(dx, dy, 0);
        }
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

      NPC.prototype.move = function(dx, dy, walkspeed) {
        var cbs, count, m_i, marker, sheet, target,
          _this = this;
        if (board.getPaused()) {
          return false;
        }
        cbs = this.move_callbacks;
        marker = this.marker;
        target = this.getTargetTile(dx, dy);
        if (this.moving === true) {
          return false;
        }
        sheet = this.setSpriteSheet(dx, dy);
        if (!this.checkEnterable(target, dx, dy)) {
          return false;
        }
        if (!this.stage || !marker) {
          throw new Error("There is no stage or marker assigned to this NPC!");
        }
        count = 0;
        this.moving = true;
        m_i = setInterval(function() {
          if (count < 10) {
            marker.x += 5 * dx;
            marker.y += 5 * dy;
            cbs.change.call(_this, dx, dy);
          } else {
            clearInterval(m_i);
            _this.moving = false;
            _this.checkTrigger(target);
            _this.leaveSquare();
            _this.enterSquare(target, dx, dy);
            _this.reanimate("run", .13, "run");
            cbs.done.call(_this, dx, dy);
          }
          return count++;
        }, walkspeed || _p.walkspeed);
        return true;
      };

      /* Battle functions!*/


      NPC.prototype.initTurn = function() {
        return this.actions = {
          standard: 1,
          move: 2,
          minor: 2
        };
      };

      NPC.prototype.actions = {
        standard: 1,
        move: 2,
        minor: 2
      };

      NPC.prototype.takeStandard = function() {
        var actions;
        actions = this.actions;
        if (actions.standard > 0) {
          actions.standard--;
          actions.move--;
          actions.minor--;
        }
        return this;
      };

      NPC.prototype.takeMove = function() {
        var actions;
        actions = this.actions;
        if (actions.move > 0) {
          actions.move--;
        }
        return this;
      };

      NPC.prototype.takeMinor = function() {
        var actions;
        actions = this.actions;
        if (actions.minor > 0) {
          return actions.minor--;
        }
      };

      NPC.prototype.canTakeAction = function() {
        var flag;
        flag = false;
        _.each(this.actions, function(action) {
          if (action > 0) {
            return flag = true;
          }
        });
        return flag;
      };

      NPC.prototype.getTargetTile = function(dx, dy, start) {
        var chunk, x, y, _ref1;
        chunk = mapper.getVisibleChunk().children;
        y = start ? start.y : this.marker.y;
        x = start ? start.x : this.marker.x;
        console.log("got target tile");
        return ((_ref1 = chunk[(y + (50 * dy)) / 50]) != null ? _ref1.children[(x + (50 * dx)) / 50] : void 0) || {};
      };

      NPC.prototype.virtualMove = function(dx, dy, start, extra) {
        var target;
        extra || (extra = 0);
        if (board.getPaused()) {
          return false;
        }
        target = this.getTargetTile(dx, dy, start);
        if (_.isEmpty(target)) {
          return false;
        }
        if (target.tileModel.discovered) {
          return false;
        }
        if (!this.checkEnterable(target, dx, dy, start)) {
          return false;
        }
        return target;
      };

      NPC.prototype.virtualMovePossibilities = function(done) {
        var checkQueue, enqueue, i, movable, speed, square, start, _i;
        speed || (speed = this.get("attrs").spd);
        start || (start = this.getTargetTile(0, 0));
        done || (done = function(target) {
          return target.tileModel.trigger("potentialmove");
        });
        checkQueue = [];
        movable = new Row;
        checkQueue.unshift(start);
        start.tileModel.discovered = true;
        start.tileModel.distance = 0;
        enqueue = function(distance, target) {
          var d;
          if (!target) {
            return;
          }
          d = target.m ? target.m : 1;
          if (distance + d > speed) {
            return;
          } else {
            target.tileModel.distance = distance + d;
          }
          target.tileModel.discovered = true;
          checkQueue.unshift(target);
          return done.call(this, target);
        };
        while (checkQueue.length > 0) {
          square = checkQueue.pop();
          movable.push(square.tileModel);
          for (i = _i = -1; _i <= 1; i = ++_i) {
            if (i === 0) {
              continue;
            }
            enqueue(square.tileModel.distance, this.virtualMove(0, i, square));
            enqueue(square.tileModel.distance, this.virtualMove(i, 0, square));
          }
        }
        _.each(movable.models, function(tile) {
          return tile.discovered = false;
        });
        return movable;
      };

      NPC.prototype.setAttrs = function(attrs) {
        var current;
        current = this.get("attrs");
        return this.set("attrs", _.extend(current, attrs));
      };

      NPC.prototype.dead = false;

      NPC.prototype.die = function() {
        return this.dead = true;
      };

      NPC.prototype.isDead = function() {
        return this.dead;
      };

      NPC.prototype.defaults = function() {
        return {
          name: "NPC",
          inventory: new items.Inventory,
          init: 1,
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

      NPC.prototype.setCurrentSpace = function() {
        var target;
        target = this.getTargetTile(0, 0);
        if (target) {
          this.currentspace = target;
          target.occupied = true;
          target.occupiedBy = this.marker;
        }
        return target;
      };

      return NPC;

    })(Backbone.Model);
    CharacterArray = (function(_super) {
      __extends(CharacterArray, _super);

      function CharacterArray() {
        _ref1 = CharacterArray.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      CharacterArray.prototype.model = NPC;

      CharacterArray.prototype.getAverageLevel = function() {
        var sum,
          _this = this;
        sum = 0;
        _.each(this.models, function(PC) {
          if (!PC.isDead()) {
            return sum += PC.get("level");
          }
        });
        return Math.ceil(sum / this.length);
      };

      return CharacterArray;

    })(Backbone.Collection);
    return {
      NPC: NPC,
      NPCArray: CharacterArray
    };
  });

}).call(this);
