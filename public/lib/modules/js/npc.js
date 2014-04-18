(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "board", "items", "powers", "mapper", "underscore", "backbone"], function(globals, ut, board, items, powers, mapper) {
    var CharacterArray, CharacterPropertyView, Enemy, NPC, Row, coordToDir, _events, _p, _ref, _ref1, _ref2, _ref3, _ts;
    _ts = globals.map.tileside;
    _events = globals.shared_events;
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
      walkspeed: 20
    };
    _ts = globals.map.tileside;
    NPC = (function(_super) {
      __extends(NPC, _super);

      function NPC() {
        _ref = NPC.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      NPC.prototype.currentspace = {};

      NPC.prototype.active = false;

      NPC.prototype.dead = false;

      NPC.prototype.dispatched = false;

      NPC.prototype.actions = _.extend({
        standard: 1,
        move: 2,
        minor: 2,
        change: function() {
          return this.trigger("change", _.pick(this, "standard", "move", "minor"));
        }
      }, Backbone.Events);

      NPC.prototype.turnPhase = 0;

      NPC.prototype.type = 'npc';

      NPC.prototype.move_callbacks = {
        done: function() {},
        change: function() {}
      };

      NPC.prototype.defaults = function() {
        var inventory, pow,
          _this = this;
        pow = powers.getDefaultPowers();
        _.each(pow.models, function(power) {
          return power.ownedBy = _this;
        });
        inventory = items.getDefaultInventory();
        this.listenToOnce(globals.shared_events, "items_loaded", function() {
          return _this.set("inventory", items.getDefaultInventory({
            belongsTo: _this
          }));
        });
        this.listenToOnce(globals.shared_events, "powers_loaded", function() {
          _this.set("powers", pow = powers.getDefaultPowers());
          return _.each(pow.models, function(power) {
            return power.ownedBy = _this;
          });
        });
        return {
          name: "NPC",
          inventory: inventory,
          powers: pow,
          init: 1,
          type: 'npc',
          "class": 'peasant',
          creatine: 10,
          max_creatine: 10,
          race: 'human',
          level: 1,
          HP: 10,
          max_HP: 10,
          spd: 10,
          AC: 10,
          jmp: 2,
          atk: 3,
          regY: 0,
          current_chunk: {
            x: 0,
            y: 0
          },
          spriteimg: "images/sprites/hero.png",
          frames: {
            down: [[0, 0, 55, 55, 0], [55, 0, 55, 55, 0], [110, 0, 55, 55, 0], [165, 0, 55, 55, 0]],
            left: [[0, 55, 55, 55, 0], [55, 55, 55, 55, 0], [110, 55, 55, 55, 0], [165, 55, 55, 55, 0]],
            right: [[0, 110, 55, 55, 0], [55, 110, 55, 55, 0], [110, 110, 55, 55, 0], [165, 110, 55, 55, 0]],
            up: [[0, 165, 55, 55, 0], [55, 165, 55, 55, 0], [110, 165, 55, 55, 0], [165, 165, 55, 55, 0]]
          }
        };
      };

      NPC.prototype.initialize = function(_arg) {
        var frames, spriteimg, _ref1,
          _this = this;
        _ref1 = _arg != null ? _arg : {}, frames = _ref1.frames, spriteimg = _ref1.spriteimg;
        _.bind(this.move_callbacks.done, this);
        _.bind(this.move_callbacks.change, this);
        this.walkopts = _.extend(this.getPrivate("walkopts"), {
          images: [this.get("spriteimg")]
        });
        this.frames = this.get("frames");
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
        this.createMarker();
        this.on("add", function(model, coll) {
          if (coll.type === "InitiativeQueue") {
            return _this.activity_queue = coll;
          }
        });
        return this.cursor();
      };

      NPC.prototype.canOccupy = function(t) {
        if (t.end === false) {
          return false;
        }
        if (t.e === "f") {
          return false;
        }
        if (t.occupied === true) {
          return false;
        }
        return true;
      };

      NPC.prototype.createMarker = function() {
        var nameobj, sheet, sprite;
        sheet = this.sheets["0,1"];
        sheet.getAnimation("run").speed = .13;
        sheet.getAnimation("run").next = "run";
        sprite = new createjs.Sprite(sheet, "run");
        this.marker = new createjs.Container();
        this.marker.regY = this.get("regY");
        this.marker.addChild(sprite);
        this.marker.icon = sprite;
        nameobj = new createjs.Text(this.get("name"), "14px Arial", "#fff");
        return this.marker.addChild(_.extend(nameobj, {
          shadow: globals.textshadow,
          y: 40
        }));
      };

      NPC.prototype.cursor = function() {
        var c;
        c = this.c || board.newCursor();
        this.c = c;
        c.hide().move(this.marker);
        return c;
      };

      NPC.prototype.canMoveOffChunk = function(x, y) {
        return !(board.hasState("battle")) && board.inBounds(x) && board.inBounds(y);
      };

      NPC.prototype.checkElevation = function(target, start) {
        start || (start = this.currentspace);
        return !(Math.abs(start.elv - target.elv) > this.get('jmp'));
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

      NPC.prototype.deltaToString = function(dx, dy) {
        if (dx !== 0) {
          return "x";
        } else if (dy !== 0) {
          return "y";
        } else {
          return "";
        }
      };

      NPC.prototype.equip = function(item) {
        return item.set("equipped", true);
      };

      NPC.prototype.obtain = function(item) {
        item.set("belongsTo", this);
        return item.set("equipped", false);
      };

      NPC.prototype.enterSquare = function(target, dx, dy) {
        target || (target = mapper.getTargetTile(0, 0, this.marker));
        target.tileModel.occupy(this);
        this.currentspace = target;
        if (target.end === false || target.end === "false" && (dx !== 0 && dy !== 0)) {
          return this.move(dx, dy, 0);
        }
      };

      NPC.prototype.getCurrentSpace = function() {
        return this.currentspace;
      };

      NPC.prototype.getQuadrant = function() {
        var x, y;
        x = this.marker.x - 3 * globals.map.c_width / 4;
        y = this.marker.y - globals.map.c_height / 2;
        if (x < 0 && y < 0) {
          return 2;
        } else if (x <= 0 && y >= 0) {
          return 3;
        } else if (x >= 0 && y <= 0) {
          return 1;
        } else {
          return 4;
        }
      };

      NPC.prototype.getX = function() {
        return this.marker.x / _ts;
      };

      NPC.prototype.getY = function() {
        return this.marker.y / _ts;
      };

      NPC.prototype.isPC = function() {
        return false;
      };

      NPC.prototype.leaveSquare = function() {
        this.currentspace.occupied = false;
        this.currentspace.occupiedBy = null;
        return this;
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

      NPC.prototype.move = function(dx, dy, walkspeed) {
        var marker, sheet, target;
        if (board.isPaused()) {
          return false;
        }
        marker = this.marker;
        target = mapper.getTargetTile(dx, dy, this.currentspace);
        if (this.moving === true) {
          return false;
        }
        sheet = this.turn(dx, dy);
        if (!target.tileModel.checkEnterable(dx, dy, null, {
          character: this
        })) {
          return false;
        }
        if (!this.stage || !marker) {
          throw new Error("There is no stage or marker assigned to this NPC!");
        }
        this.moving = true;
        this.moveInterval(dx, dy);
        return true;
      };

      NPC.prototype.moveInterval = function(dx, dy, walkspeed) {
        var cbs, count, m_i, target,
          _this = this;
        this.cursor();
        this.turn(dx, dy);
        target = mapper.getTargetTile(dx, dy, this.currentspace);
        count = 0;
        cbs = this.move_callbacks;
        m_i = setInterval(function() {
          if (count < 10) {
            _this.marker.x += 5 * dx;
            _this.marker.y += 5 * dy;
            if (_this.c.isVisible()) {
              _this.c.move(_this.marker);
            }
            cbs.change.call(_this, dx, dy);
          } else {
            clearInterval(m_i);
            _this.moving = false;
            _this.checkTrigger(target);
            _this.leaveSquare();
            _this.c.move(_this.marker).show();
            _this.enterSquare(target, dx, dy);
            _this.reanimate("run", .13, "run");
            _this.trigger("donemoving");
            cbs.done.call(_this, dx, dy);
          }
          return count++;
        }, walkspeed || _p.walkspeed);
        return true;
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

      NPC.prototype.reanimate = function(animation, speed, next) {
        var sheet;
        sheet = this.marker.icon.spriteSheet;
        sheet.getAnimation(animation || "run").speed = speed;
        return sheet.getAnimation(animation || "run").next = next;
      };

      NPC.prototype.roundToNearestTile = function(x, y, dx, dy) {
        return {
          x: Math.ceil(x / _ts) * _ts,
          y: Math.ceil(y / _ts) * _ts
        };
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

      NPC.prototype.setPos = function(x, y) {
        this.marker.x = x;
        this.marker.y = y;
        return this;
      };

      NPC.prototype.turn = function(dx, dy) {
        var sheet, x, y;
        x = ut.floorToOne(dx);
        y = ut.floorToOne(dy);
        if (x !== 0 && y !== 0) {
          x = 0;
        }
        sheet = this.sheets[x + "," + y];
        if (!sheet) {
          alert("FUCKED UP IN TURN");
        }
        return this.marker.icon.spriteSheet = sheet;
      };

      /* Battle functions!*/


      NPC.prototype.addToMap = function() {
        var chunk, tile, x, y, _ref1, _ref2, _ref3;
        chunk = (_ref1 = mapper.getVisibleChunk()) != null ? _ref1.children : void 0;
        x = Math.abs(Math.ceil(Math.random() * globals.map.c_width / _ts - 1));
        y = Math.abs(Math.ceil(Math.random() * globals.map.c_height / _ts - 1));
        tile = (_ref2 = chunk[y]) != null ? _ref2.children[x] : void 0;
        while (this.canOccupy(tile) === false) {
          y++;
          x++;
          tile = (_ref3 = chunk[y = y % (globals.map.tileheight - 1)]) != null ? _ref3.children[x = x % (globals.map.tilewidth - 1)] : void 0;
        }
        this.enterSquare(tile);
        this.marker.x = x * _ts;
        this.marker.y = y * _ts;
        board.addMarker(this);
        return this;
      };

      NPC.prototype.burnAction = function() {
        if (this.takeMove(true)) {
          true;
        } else if (this.takeStandard(true)) {
          true;
        } else if (this.takeMinor(true)) {
          true;
        }
        return false;
      };

      NPC.prototype.can = function(type) {
        return this.actions[type.toLowerCase()] > 0;
      };

      NPC.prototype.canTakeAction = function() {
        return this.can("minor") || this.can("move") || this.can("standard");
      };

      NPC.prototype.defend = function() {
        this.set("AC", this.get("AC") + 2);
        this.takeMove();
        return this;
      };

      NPC.prototype.die = function() {
        this.dead = true;
        this.trigger("die", this, this.collection, {});
        board.getStage().removeChild(this.marker);
        return this.leaveSquare();
      };

      NPC.prototype.dispatch = function(dispatcher) {
        this.dispatched = true;
        this.setPos(dispatcher.getX(), dispatcher.getY());
        this.enterSquare(dispatcher.currentspace, 0, 0);
        this.trigger("dispatch");
        return this;
      };

      NPC.prototype.endTurn = function() {
        this.active = false;
        this.turnPhase = 0;
        this.trigger("turndone");
        this.resetActions();
        return this;
      };

      NPC.prototype.getPrivate = function(id) {
        return _p[id];
      };

      NPC.prototype.highlightTile = function(color) {
        var currenttile;
        currenttile = this.currentspace;
        if (!currenttile) {
          return this;
        }
        currenttile.tileModel.trigger("generalhighlight", color);
        return this;
      };

      NPC.prototype.indicateActive = function() {
        _.each(this.activity_queue.models, function(character) {
          return character.c.hide();
        });
        this.c.show().move(this.marker);
        return this;
      };

      NPC.prototype.initTurn = function() {
        this.indicateActive();
        this.active = true;
        globals.shared_events.trigger("closemenus");
        this.menu.open();
        return this.nextPhase();
      };

      NPC.prototype.isActive = function() {
        return this.active;
      };

      NPC.prototype.isDead = function() {
        return this.dead;
      };

      NPC.prototype.nextPhase = function() {
        var t,
          _this = this;
        t = this.turnPhase;
        if (t === 3) {
          return this.endTurn();
        }
        battler.resetTimer().startTimer(this.i || this.get("init"), function() {
          _this.burnAction();
          console.log(_this.actions);
          return _this.nextPhase();
        });
        this.trigger("beginphase", this.turnPhase);
        return this.turnPhase++;
      };

      NPC.prototype.resetActions = function() {
        this.actions = _.extend(this.actions, {
          standard: 1,
          move: 2,
          minor: 2
        });
        this.actions.change();
        return this;
      };

      NPC.prototype.takeStandard = function(burn) {
        var actions;
        actions = this.actions;
        if (actions.standard > 0) {
          actions.standard--;
          actions.move--;
          actions.change();
        }
        if (!burn) {
          this.nextPhase();
        }
        return this;
      };

      NPC.prototype.takeMove = function(burn) {
        var actions;
        actions = this.actions;
        if (actions.move > 0) {
          actions.move--;
        }
        if (actions.move === 0) {
          if (actions.standard > 0) {
            actions.standard--;
          }
          actions.minor--;
        }
        actions.change();
        if (!burn) {
          this.nextPhase();
        }
        return this;
      };

      NPC.prototype.takeMinor = function(burn) {
        var actions;
        actions = this.actions;
        if (actions.minor > 0) {
          actions.minor--;
        }
        if (actions.minor === 0) {
          actions.move--;
          actions.change();
        }
        if (!burn) {
          this.nextPhase();
        }
        return this;
      };

      NPC.prototype.takeAction = function(type) {
        var actions;
        actions = ["standard", "minor", "move"];
        if (actions.indexOf(type) !== -1) {
          this["take" + type.capitalize()]();
        }
        return this;
      };

      NPC.prototype.takeDamage = function(damage) {
        var d_i,
          _this = this;
        if (this.isDead()) {
          return this;
        }
        this.set("HP", this.get("HP") - damage);
        if (this.get("HP") <= 0) {
          this.die();
        }
        damage = new createjs.Text(damage + " HP", "bold 18px Arial", "#ff0000");
        damage = _.extend(damage, {
          shadow: globals.textshadow,
          y: -10
        });
        this.marker.addChild(damage);
        d_i = setInterval(function() {
          damage.y -= 2;
          if (damage.y < -30) {
            clearInterval(d_i);
            return _this.marker.removeChild(damage);
          }
        }, 100);
        return this;
      };

      NPC.prototype.useCreatine = function(creatine) {
        var current;
        current = this.get("creatine");
        if (current - creatine < 0) {
          return false;
        }
        this.set("creatine", current - creatine);
        return this;
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

      CharacterArray.prototype.type = 'NPCArray';

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

      CharacterArray.prototype.comparator = function(model) {
        return model.i;
      };

      CharacterArray.prototype.anyDispatched = function() {
        return (_.filter(this.models, function(model) {
          return model.dispatched === true;
        })).length > 0;
      };

      return CharacterArray;

    })(Backbone.Collection);
    CharacterPropertyView = (function(_super) {
      __extends(CharacterPropertyView, _super);

      function CharacterPropertyView() {
        _ref2 = CharacterPropertyView.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      CharacterPropertyView.prototype.template = $("#character-view").html();

      CharacterPropertyView.prototype.render = function() {
        this.$el.html(_.template(this.template, this.model.toJSON()));
        return this;
      };

      return CharacterPropertyView;

    })(Backbone.View);
    Enemy = (function(_super) {
      __extends(Enemy, _super);

      function Enemy() {
        _ref3 = Enemy.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      Enemy.prototype.type = 'enemy';

      Enemy.prototype.defaults = function() {
        var defaults;
        defaults = Enemy.__super__.defaults.apply(this, arguments);
        return _.extend(defaults, {
          type: 'enemy'
        });
      };

      return Enemy;

    })(NPC);
    return {
      NPC: NPC,
      NPCArray: CharacterArray,
      Enemy: Enemy
    };
  });

}).call(this);
