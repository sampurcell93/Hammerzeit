(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "board", "items", "powers", "mapper", "cast", "underscore", "backbone"], function(globals, ut, board, items, powers, mapper, cast) {
    var CharacterArray, CharacterPropertyView, Enemy, Modifier, ModifierCollection, NPC, Row, coordToDir, _events, _ref, _ref1, _ref2, _ref3, _ts;
    _ts = globals.map.tileside;
    _events = globals.shared_events;
    Row = mapper.Row;
    ModifierCollection = items.ModifierCollection;
    Modifier = items.Modifier;
    coordToDir = function(coord, orientation) {
      if (orientation == null) {
        orientation = "1";
      }
      return {
        "-1x": "left",
        "1x": "right",
        "-1y": "up",
        "1y": "down"
      }[orientation.toString() + coord];
    };
    _ts = globals.map.tileside;
    NPC = (function(_super) {
      __extends(NPC, _super);

      function NPC() {
        this.canEquip = __bind(this.canEquip, this);
        _ref = NPC.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      NPC.prototype.currentspace = {};

      NPC.prototype.active = false;

      NPC.prototype.dead = false;

      NPC.prototype.defending = false;

      NPC.prototype.dispatched = false;

      NPC.prototype.turnPhase = 0;

      NPC.prototype.type = 'npc';

      NPC.prototype.colors = {
        "HP": ["#ff0000", "#fff"],
        "AC": ["#ff0000", "#fff"],
        "creatine": ["#ff0000", "blue"]
      };

      NPC.prototype.walkopts = {
        framerate: 30,
        animations: {
          run: [0, 3]
        },
        images: ["images/sprites/hero.png"]
      };

      NPC.prototype.walkspeed = 20;

      NPC.prototype.move_callbacks = {
        done: function() {},
        change: function() {}
      };

      NPC.prototype.prepareForSave = function() {
        var a, attrs;
        attrs = this.toJSON();
        return a = _.extend(attrs, {
          inventory: attrs.inventory.toJSON(true),
          powers: attrs.powers.toJSON(true),
          path: attrs.path.get("name"),
          slots: attrs.slots.toJSON(true),
          marker: {
            x: this.marker.x,
            y: this.marker.y
          }
        });
      };

      NPC.prototype.defaults = function() {
        return {
          AC: 10,
          atk: 3,
          currentstage: 1,
          creatine: 10,
          eco: 10,
          max_creatine: 10,
          HP: 100,
          max_HP: 100,
          init: 1,
          inventory: items.Inventory(),
          modifiers: new ModifierCollection(),
          statuses: new ModifierCollection(),
          skills: cast.Skillset(),
          jmp: 2,
          level: 1,
          name: "NPC",
          path: 'peasant',
          powers: powers.PowerSet(),
          race: 'human',
          range: 1,
          regY: 0,
          type: 'npc',
          slots: items.Slots(),
          spd: 10,
          spriteimg: "images/sprites/hero.png",
          XP: 0,
          frames: {
            down: [[0, 0, 55, 55, 0], [55, 0, 55, 55, 0], [110, 0, 55, 55, 0], [165, 0, 55, 55, 0]],
            left: [[0, 55, 55, 55, 0], [55, 55, 55, 55, 0], [110, 55, 55, 55, 0], [165, 55, 55, 55, 0]],
            right: [[0, 110, 55, 55, 0], [55, 110, 55, 55, 0], [110, 110, 55, 55, 0], [165, 110, 55, 55, 0]],
            up: [[0, 165, 55, 55, 0], [55, 165, 55, 55, 0], [110, 165, 55, 55, 0], [165, 165, 55, 55, 0]]
          }
        };
      };

      NPC.prototype.initialize = function(_arg) {
        var frames, inventory, marker, path, pow, spriteimg, _ref1,
          _this = this;
        _ref1 = _arg != null ? _arg : {}, pow = _ref1.pow, frames = _ref1.frames, spriteimg = _ref1.spriteimg, path = _ref1.path, inventory = _ref1.inventory, marker = _ref1.marker;
        if (!(path instanceof Backbone.Model)) {
          this.setPath(path, this.get("level"));
        }
        this.actions = _.extend({}, Backbone.Events);
        this.resetActions();
        this.setPowers(pow);
        this.setInventory(inventory);
        this.listenToOnce(globals.shared_events, "items:loaded", function() {
          return _this.set("inventory", _this.get("path").getDefaultInventory({
            belongsTo: _this
          }));
        });
        this.listenToOnce(globals.shared_events, "powers:loaded", function() {
          return _this.set("powers", pow = powers.getDefaultPowers({
            belongsTo: _this
          }));
        });
        _.bind(this.move_callbacks.done, this);
        _.bind(this.move_callbacks.change, this);
        this.walkopts = _.extend(this.walkopts, {
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
        this.onTurnFunctions = [];
        this.listenToStatusChanges();
        this.on("change:XP", function(model, XP) {
          var level;
          level = this.get("path").isNewLevel(XP);
          if (level) {
            return alert("new level!! " + level);
          }
        });
        this.createMarker(marker);
        this.on("add", function(model, coll) {
          if (coll.type === "InitiativeQueue") {
            return _this.activity_queue = coll;
          }
        });
        this.cursor();
        return this;
      };

      NPC.prototype.applyModifiers = function(modifiers, opts) {
        var len,
          _this = this;
        if (opts == null) {
          opts = {};
        }
        if (modifiers instanceof Modifier) {
          this.get("modifiers").add(modifiers);
          if (opts.donetext) {
            setTimeout(function() {
              return _this.drawStatusChange({
                text: opts.donetext
              });
            }, 1000);
          }
        } else {
          len = modifiers.length;
          _.each(modifiers.models, function(mod, i) {
            var num;
            num = i;
            if (i === 0) {
              i = 100;
            } else {
              i = 700 * i;
            }
            setTimeout(function() {
              return _this.get("modifiers").add(mod, opts);
            }, i);
            if (num === len - 1 && opts.donetext) {
              return setTimeout(function() {
                return _this.drawStatusChange({
                  text: opts.donetext
                });
              }, 1.6 * (i + 1));
            }
          });
        }
        return this;
      };

      NPC.prototype.canOccupy = function(t) {
        if (t.end === false) {
          return false;
        }
        if (t.e === "f") {
          return false;
        }
        if (t.tileModel.isOccupied() === true) {
          return false;
        }
        return true;
      };

      NPC.prototype.clean = function() {
        var o;
        o = _.omit(this.toJSON(), "creatine", "HP", "max_HP", "max_creatine", "current_chunk", "regY", "spriteimg", "frames", "modifiers", "statuses");
        o.path = o.path.get("name");
        return o;
      };

      NPC.prototype.createMarker = function(_arg) {
        var nameobj, sheet, sprite, x, y, _ref1;
        _ref1 = _arg != null ? _arg : {}, x = _ref1.x, y = _ref1.y;
        sheet = this.sheets["0,1"];
        sheet.getAnimation("run").speed = .13;
        sheet.getAnimation("run").next = "run";
        sprite = new createjs.Sprite(sheet, "run");
        this.marker = new createjs.Container();
        this.marker.regY = this.get("regY");
        this.marker.addChild(sprite);
        this.marker.icon = sprite;
        nameobj = new createjs.Text(this.get("name"), "14px Arial", "#fff");
        this.marker.addChild(_.extend(nameobj, {
          shadow: globals.textshadow,
          y: 40
        }));
        if (x) {
          this.marker.x = x;
        }
        if (y) {
          this.marker.y = y;
        }
        return this;
      };

      NPC.prototype.cursor = function() {
        var c;
        c = this.c || board.newCursor();
        this.c = c;
        c.hide().move(this.marker);
        return c;
      };

      NPC.prototype.canEquip = function(item) {
        return this.get("slots").get(item.get("slot")) === null;
      };

      NPC.prototype.canMoveOffChunk = function(x, y) {
        return !(board.hasState("battle")) && board.inBounds(x) && board.inBounds(y);
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

      NPC.prototype.drawStatusChange = function(opts) {
        var d_i, defaults, status, staus,
          _this = this;
        if (opts == null) {
          opts = {};
        }
        defaults = {
          font: "bold 18px Arial",
          color: "#fff",
          text: "!!",
          done: function() {}
        };
        opts = _.extend(defaults, opts);
        status = new createjs.Text(opts.text, opts.font, opts.color);
        staus = _.extend(status, {
          shadow: globals.textshadow,
          y: 20
        });
        this.marker.addChild(status);
        d_i = setInterval(function() {
          status.y -= 2;
          if (status.y < 0) {
            clearInterval(d_i);
            _this.marker.removeChild(status);
            return opts.done();
          }
        }, 100);
        return this;
      };

      NPC.prototype.equip = function(item, opts) {
        var slot;
        if (opts == null) {
          opts = {};
        }
        slot = item.get("slot");
        if (this.canEquip(item)) {
          item.set("equipped", true, opts);
          this.get("slots").set(slot, item, opts);
        } else {
          this.drawStatusChange({
            text: "" + slot + " already equipped!",
            color: "red"
          });
        }
        return this;
      };

      NPC.prototype.enterSquare = function(target, dx, dy) {
        if (target == null) {
          target = mapper.getTargetTile(0, 0, this.marker);
        }
        if (dx == null) {
          dx = 0;
        }
        if (dy == null) {
          dy = 0;
        }
        console.log(target);
        target.tileModel.occupy(this);
        this.currentspace = target;
        if (target.end === false || target.end === "false" && (dx !== 0 && dy !== 0)) {
          this.move(dx, dy, 0);
        }
        return this;
      };

      NPC.prototype.getCurrentSpace = function() {
        return this.currentspace;
      };

      NPC.prototype.getAttrDifference = function(key) {
        return this.previous(key) - this.get(key);
      };

      NPC.prototype.getChangeModifier = function(difference) {
        if (difference < 0) {
          return "+";
        } else {
          return "-";
        }
      };

      NPC.prototype.getChangeColor = function(attr, value) {
        value = value > 0 ? 0 : 1;
        return this.colors[attr][value];
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

      NPC.prototype.hasItem = function(item) {
        return this.get("inventory").contains(item);
      };

      NPC.prototype.isPC = function() {
        return false;
      };

      NPC.prototype.leaveSquare = function() {
        this.currentspace.tileModel.leave();
        return this;
      };

      NPC.prototype.listenToStatusChanges = function() {
        var handleChange,
          _this = this;
        handleChange = function(diff, str) {
          var color;
          color = _this.getChangeColor("HP", diff);
          return _this.drawStatusChange({
            text: _this.getChangeModifier(diff) + Math.abs(diff) + str,
            color: color
          });
        };
        _.each(["HP", "creatine", "AC", "atk", "range"], function(attr) {
          return _this.on("change:" + attr, function(model, val) {
            return handleChange(_this.getAttrDifference(attr), attr);
          });
        });
        return this.listenTo(this.get("modifiers"), {
          "add": function(modifier, collection) {
            var currentval, max, mod, newval;
            currentval = _this.get(modifier.get("prop"));
            mod = modifier.get("mod");
            if (_.isFunction(mod)) {
              newval = mod.call(mod, _this, currentval);
            } else {
              newval = currentval + mod;
            }
            max = _this.get("max_" + (modifier.get('prop')));
            if (max && newval > max) {
              newval = max;
            } else if (newval < 0) {
              newval = 0;
            }
            _this.set(modifier.get("prop"), newval);
            if (modifier.get("turns")) {
              return _this.addTurnFunction(_.extend({
                fn: function() {
                  return _this.removeModifiers(modifier);
                }
              }, modifier.toJSON()));
            } else if (modifier.get("perm") === true) {
              return _this.removeModifiers(modifier, {
                silent: true
              });
            }
          },
          "remove": function(modifier, collection) {
            var currentval;
            currentval = _this.get(modifier.get("prop"));
            return _this.set(modifier.get("prop"), currentval - modifier.get("mod"));
          }
        });
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
        if (_.isEmpty(target)) {
          if (dx < 0) {
            this.changeChunk(-1);
          } else if (dx > 0) {
            this.changeChunk(1);
          } else if (dy < 0) {
            this.changeChunk(null, -1);
          } else {
            this.changeChunk(null, 1);
          }
          return true;
        }
        if (!target.tileModel.checkEnterable(dx, dy, null, {
          character: this
        })) {
          return false;
        }
        if (!target.tileModel.tooHigh(this.currentspace, this.get("jmp"))) {
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
        if (walkspeed == null) {
          walkspeed = this.walkspeed;
        }
        this.turn(dx, dy);
        target = mapper.getTargetTile(dx, dy, this.currentspace);
        count = 0;
        cbs = this.move_callbacks;
        m_i = setInterval(function() {
          if (count < 10) {
            _this.marker.x += 5 * dx;
            _this.marker.y += 5 * dy;
            cbs.change.call(_this, dx, dy);
          } else {
            clearInterval(m_i);
            _this.moving = false;
            _this.checkTrigger(target);
            _this.leaveSquare();
            _this.enterSquare(target, dx, dy);
            _this.reanimate("run", .13, "run");
            _this.trigger("donemoving");
            cbs.done.call(_this, dx, dy);
          }
          return count++;
        }, walkspeed);
        return true;
      };

      NPC.prototype.obtain = function(item, quantity) {
        var existing;
        if (quantity == null) {
          quantity = 1;
        }
        existing = this.hasItem(item);
        if (existing) {
          quantity += existing.get("quantity");
          item = existing;
        }
        item.set("quantity", quantity);
        item.set("belongsTo", this);
        item.set("equipped", false);
        this.get("inventory").add(item);
        return this;
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

      NPC.prototype.removeModifiers = function(modifiers, opts) {
        var filter, len, num,
          _this = this;
        if (modifiers == null) {
          modifiers = this.get("modifiers");
        }
        if (opts == null) {
          opts = {};
        }
        num = 0;
        filter = function() {
          return true;
        };
        if (modifiers instanceof Modifier) {
          this.get("modifiers").remove(modifiers, opts);
          if (opts.donetext) {
            setTimeout(function() {
              return _this.drawStatusChange({
                text: opts.donetext
              });
            }, 1000);
          }
        } else {
          if (opts.type) {
            filter = function(model) {
              return model.get("type") === opts.type;
            };
          }
          len = modifiers.length;
          _.each(modifiers.models, function(mod, i) {
            if (filter(mod) === false) {
              return;
            }
            num = i;
            if (i === 0) {
              i = 100;
            } else {
              i = 700 * i;
            }
            setTimeout(function() {
              return _this.get("modifiers").remove(mod, opts);
            }, i);
            if ((num === len - 1) && opts.donetext) {
              return setTimeout(function() {
                console.loh;
                return _this.drawStatusChange({
                  text: opts.donetext
                });
              }, 1.6 * i);
            }
          });
        }
        return this;
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

      NPC.prototype.changeChunk = function(x, y) {
        var chunk;
        if (x == null) {
          x = 0;
        }
        if (y == null) {
          y = 0;
        }
        chunk = this.get("current_chunk");
        console.log(chunk);
        debugger;
        chunk.x += x;
        chunk.y += y;
        if (y === -1) {
          this.setPos(null, globals.map.c_height);
        } else if (y === 1) {
          this.setPos(null, 0);
        }
        if (x === -1) {
          this.setPos(globals.map.c_width);
        } else if (x === 1) {
          this.setPos(0);
        }
        this.set("current_chunk", chunk, {
          silent: true
        });
        this.trigger("change:current_chunk", chunk);
        this.enterSquare();
        return this;
      };

      NPC.prototype.setPath = function(path, level) {
        if (path == null) {
          path = "Peasant";
        }
        if (level == null) {
          level = 1;
        }
        if (_.isString(path)) {
          this.set("path", cast.getClassInst(path));
        } else if (path instanceof Backbone.Model) {
          return this;
        } else if (_.isObject(path)) {
          this.set("path", cast.getClassInst(path.name));
        }
        this.get("path").set({
          level: level,
          character: this
        });
        return this;
      };

      NPC.prototype.setInventory = function(inventory) {
        var _this = this;
        if (inventory == null) {
          inventory = this.get("path").getDefaultInventory({
            belongsTo: this
          });
        }
        this.removeModifiers(null, {
          type: "Item",
          silent: true
        });
        _.each(inventory.models, function(i) {
          i.set("belongsTo", _this);
          if (i.isEquipped()) {
            i.set("equipped", false, {
              silent: true
            });
            return _this.equip(i, {
              silent: true
            });
          }
        });
        this.set("inventory", inventory);
        return this;
      };

      NPC.prototype.setPos = function(x, y) {
        if (x == null) {
          x = this.marker.x;
        }
        if (y == null) {
          y = this.marker.y;
        }
        this.marker.x = x;
        this.marker.y = y;
        return this;
      };

      NPC.prototype.setPowers = function(pow) {
        var _this = this;
        if (pow == null) {
          pow = powers.getDefaultPowers({
            belongsTo: this
          });
        }
        _.each(pow.models, function(p) {
          return p.set("belongsTo", _this);
        });
        this.set("powers", pow);
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

      NPC.prototype.unequip = function(item) {
        if (item.isEquipped()) {
          item.set("equipped", false);
          this.get("slots").set(item.get("slot"), null);
        }
        return this;
      };

      /* Battle functions!*/


      NPC.prototype.addTurnFunction = function(opts) {
        if (opts == null) {
          opts = {};
        }
        opts = _.extend({
          timing: 0,
          turns: 1
        }, opts);
        this.onTurnFunctions.push(opts);
        return this;
      };

      NPC.prototype.addToMap = function() {
        var chunk, tile, x, y, _ref1, _ref2, _ref3;
        chunk = (_ref1 = mapper.getVisibleMap()) != null ? _ref1.children : void 0;
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
        var _this = this;
        this.applyModifiers(new Modifier({
          prop: "AC",
          mod: 2,
          turns: 1
        }), {
          donetext: "Defending!"
        });
        this.addTurnFunction({
          fn: (function() {
            return _this.defending = false;
          })
        });
        this.defending = true;
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
        this.executeTurnFunctions(1);
        this.turnPhase = 0;
        this.trigger("turndone");
        this.resetActions();
        return this;
      };

      NPC.prototype.executeTurnFunctions = function(timing) {
        var functions,
          _this = this;
        if (timing == null) {
          timing = 0;
        }
        functions = this.onTurnFunctions;
        _.each(functions, function(fun) {
          if (fun.turns > 1) {
            return fun.turns--;
          } else if (fun.timing === timing) {
            fun.fn();
            return fun.markedForDeletion = true;
          }
        });
        this.onTurnFunctions = _.reject(functions, function(fun) {
          return fun.markedForDeletion;
        });
        return this;
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
        this.executeTurnFunctions();
        this.indicateActive();
        this.active = true;
        globals.shared_events.trigger("menu:close");
        this.menu.open();
        return this.nextPhase();
      };

      NPC.prototype.isActive = function() {
        return this.active;
      };

      NPC.prototype.isDead = function() {
        return this.dead;
      };

      NPC.prototype.isDefending = function() {
        return this.defending;
      };

      NPC.prototype.isDispatched = function() {
        return this.dispatched;
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
          return _this.nextPhase();
        });
        this.trigger("beginphase", this.turnPhase);
        return this.turnPhase++;
      };

      NPC.prototype.resetActions = function() {
        this.actions = _.extend(this.actions, {
          standard: 1,
          move: 2,
          minor: 2,
          change: function() {
            return this.trigger("change", _.pick(this, "standard", "move", "minor"));
          }
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
        } else {
          this.drawStatusChange({
            text: 'Burned Action',
            color: 'red'
          });
        }
        return this;
      };

      NPC.prototype.takeMove = function(burn) {
        var actions;
        console.log("moving?");
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
        } else {
          this.drawStatusChange({
            text: 'Burned Action',
            color: 'red'
          });
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
        } else {
          this.drawStatusChange({
            text: 'Burned Action',
            color: 'red'
          });
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
        this.applyModifiers(new Modifier({
          prop: "HP",
          mod: -damage,
          perm: true
        }));
        if (this.get("HP") <= 0) {
          this.die();
        }
        return this;
      };

      NPC.prototype.useCreatine = function(creatine) {
        this.applyModifiers(new Modifier({
          prop: "creatine",
          mod: -creatine,
          perm: true
        }));
        return this;
      };

      NPC.prototype.parse = function(m) {
        m.inventory = new items.Inventory(m.inventory, {
          parse: true
        });
        m.powers = powers.PowerSet(m.powers, {
          parse: true
        });
        m.slots = items.Slots(m.slots);
        m.modifiers = new ModifierCollection(m.modifiers, {
          parse: true
        });
        return m;
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
