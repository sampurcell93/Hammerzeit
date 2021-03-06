(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["console", "board", "globals", "utilities", "taskrunner", "mapper", "npc", "player", "cast", "items"], function(activity, board, globals, ut, taskrunner, mapper, NPC, player, cast, items) {
    var Battle, Dispatcher, Enemy, GridOverlay, GridSquare, InitiativeQueue, NPCArray, Player, Timer, battle_events, discardDispatch, getActive, getQueue, hit_template, map, setPotentialMoves, stage, states, virtualMovePossibilities, _activebattle, _activemap, _ref, _ref1, _ref2, _ref3, _shared, _sm, _timer, _ts;
    window.t = function() {
      return getQueue().next();
    };
    Player = player.model;
    NPCArray = NPC.NPCArray;
    Enemy = NPC.Enemy;
    stage = board.getStage();
    map = globals.map;
    _sm = 20;
    _ts = globals.map.tileside;
    states = ['choosingmoves', 'choosingattacks', 'menuopen'];
    battle_events = _.extend({}, Backbone.Events);
    _activebattle = null;
    _shared = globals.shared_events;
    _activemap = null;
    _ts = globals.map.tileside;
    hit_template = "<%=attacker.get('name')%> hit <%=subject.get('name')%> for <%=hit_details.damage%> damage and <%=hit_details.modifiers%> effects with <%= power.get('name') %>";
    Battle = (function(_super) {
      __extends(Battle, _super);

      function Battle() {
        _ref = Battle.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Battle.prototype.states = [];

      Battle.prototype.defaults = function() {
        var InitQueue, PCs;
        InitQueue = new InitiativeQueue();
        PCs = InitQueue.PCs = taskrunner.getParty();
        return {
          NPCs: new NPCArray,
          InitQueue: InitQueue,
          avglevel: PCs.getAverageLevel(),
          numenemies: 5,
          enemyBounds: {
            min_x: 0,
            max_x: map.c_width,
            min_y: 0,
            max_y: map.c_height
          }
        };
      };

      Battle.prototype.initialize = function() {
        var PC;
        this.PC = PC = taskrunner.getPC();
        this.dispatcher = new Dispatcher(PC.marker.x, PC.marker.y);
        this.listenTo(this.get("NPCs"), {
          die: this.checkStillLiving
        });
        return this.on({
          "choosingmoves": function() {
            return this.clearAttackZone();
          },
          "choosingattacks": function() {
            return this.clearPotentialMoves();
          }
        });
      };

      Battle.prototype.addState = function(newstate) {
        if (this.hasState(newstate) === false) {
          return this.states.push(newstate);
        }
      };

      Battle.prototype.setState = function(newstate) {
        this.trigger("battle:state", newstate);
        this.states = [newstate];
        return this;
      };

      Battle.prototype.removeState = function(removeme) {
        var index;
        if (this.states.length > 1) {
          index = this.states.indexOf(removeme);
          if (index !== -1) {
            this.states.splice(index, 1);
          }
        } else {
          throw new Error("The battle currently has only one state - you can't remove it. Try adding another state first.");
        }
        return this;
      };

      Battle.prototype.hasState = function(checkstate) {
        return this.states === checkstate.toUpperCase();
      };

      Battle.prototype.checkStillLiving = function(model, collection, options) {
        var flag,
          _this = this;
        if (collection) {
          flag = true;
          _.each(collection.models, function(character) {
            if (character.isDead() === false) {
              return flag = false;
            }
          });
          return flag;
        }
        return false;
      };

      Battle.prototype.removeTravelPC = function() {
        stage.removeChild(this.PC.marker);
        this.PC.leaveSquare();
        return this.PC.setPos(0, 0);
      };

      Battle.prototype.begin = function(type, opts) {
        this.removeTravelPC();
        this.dispatcher.show().showDispatchMenu();
        this.grid.activate();
        if (type === "random") {
          return this.randomize(opts);
        } else {
          return this.load(type, opts);
        }
      };

      Battle.prototype.load = function(id) {
        this.url = this.id || globals.battle_dir + id;
        return this.fetch({
          success: function(battle) {
            return console.log(battle);
          }
        });
      };

      Battle.prototype.randomize = function(o) {
        var i, n, names, _i, _ref1;
        if (o == null) {
          o = {};
        }
        o = _.extend(this.defaults(), o);
        names = ["Steve", "John", "Ken", "Tom", "Bob", "Zeke", "Dan"];
        for (i = _i = 0, _ref1 = o.numenemies; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
          this.get("NPCs").add(n = new Enemy({
            name: names[i]
          }, {
            parse: true
          }));
          this.get("InitQueue").add(n);
          n.addToMap();
          globals.shared_events.trigger("menu:bind", n);
        }
        this.get("InitQueue").sort();
        return this;
      };

      Battle.prototype.destroy = function() {
        this.destructor();
        return Battle.__super__.destroy.apply(this, arguments);
      };

      Battle.prototype.destructor = function() {
        var NPCs, npc;
        NPCs = this.get("NPCs");
        while (npc = NPCs.first()) {
          npc.leaveSquare();
          stage.removeChild(npc.marker);
          npc.destroy();
        }
        return this;
      };

      Battle.prototype.clearPotentialMoves = function() {
        if (this.potential_moves == null) {
          return this;
        }
        _.each(this.potential_moves.models, function(tile) {
          return tile.removePotentialMovePath();
        });
        return this;
      };

      Battle.prototype.clearAttackZone = function() {
        if (this.attack_zone == null) {
          return this;
        }
        _.each(this.attack_zone.models, function(tile) {
          return tile.trigger("removeattackzone");
        });
        return this;
      };

      Battle.prototype.clearAllHighlights = function() {
        this.clearAttackZone();
        return this.clearPotentialMoves();
      };

      Battle.prototype.checkEndOfBattle = function(type) {
        var NPCArr, PCArr, initiative;
        initiative = this.get("InitQueue").models;
        NPCArr = [];
        PCArr = [];
        _.each(initiative, function(character) {
          if (character instanceof Player) {
            return PCArr.push(character);
          } else {
            return NPCArr.push(character);
          }
        });
        if (NPCArr.length === 0) {
          return alert("you won!");
        } else if (PCArr.length === 0) {
          return alert("they won :/");
        }
      };

      Battle.prototype.virtualMovePossibilities = function() {
        return this.grid.virtualMovePossibilities.apply(this.grid, arguments);
      };

      Battle.prototype.pulseGrid = function() {
        return this.grid.model.trigger("pulse");
      };

      Battle.prototype.activateGrid = function() {
        return this.grid.activate();
      };

      Battle.prototype.deactivateGrid = function() {
        return this.grid.deactivate();
      };

      Battle.prototype.toggleGrid = function() {
        return this.grid.toggle();
      };

      return Battle;

    })(Backbone.Model);
    Dispatcher = (function() {
      Dispatcher.prototype.visible = false;

      function Dispatcher(x, y) {
        var base, spritesheet, target;
        if (x == null) {
          x = 100;
        }
        if (y == null) {
          y = 500;
        }
        spritesheet = {
          framerate: 100,
          animations: {
            pulse: [0, 7]
          },
          frames: [[0, 0, 50, 57], [50, 0, 50, 57], [100, 0, 50, 57], [150, 0, 50, 57], [150, 0, 50, 57], [100, 0, 50, 57], [50, 0, 50, 57], [0, 0, 50, 57]]
        };
        base = new createjs.SpriteSheet(_.extend(spritesheet, {
          images: ["images/tiles/dispatchbase.png"]
        }));
        base.getAnimation("pulse").speed = .25;
        base.getAnimation("pulse").next = "pulse";
        this.marker = new createjs.Container();
        this.marker.addChild(base = new createjs.Sprite(base, "pulse"));
        base.y = 20;
        this.marker.x = x;
        this.marker.y = y;
        target = mapper.getTargetTile(0, 0, {
          x: x,
          y: y
        });
        target.tileModel.set("npc", false);
        this.currentspace = target;
        this.marker.regY = 7;
        this.bindEvents();
        this;
      }

      Dispatcher.prototype.showDispatchMenu = function() {
        battle_events.trigger("showDispatchMenu", taskrunner.getParty());
        return this;
      };

      Dispatcher.prototype.bindEvents = function() {
        this.marker.on("click", this.showDispatchMenu, false, this);
        return this;
      };

      Dispatcher.prototype.show = function() {
        this.visible = true;
        stage.addChild(this.marker);
        return this;
      };

      Dispatcher.prototype.hide = function() {
        this.visible = false;
        stage.removeChild(this.marker);
        return this;
      };

      Dispatcher.prototype.addChild = function(marker) {
        return this.marker.addChild(marker);
      };

      Dispatcher.prototype.removeChild = function(id) {
        return this.marker.removeChild(id);
      };

      Dispatcher.prototype.getX = function() {
        return this.marker.x;
      };

      Dispatcher.prototype.getY = function() {
        return this.marker.y;
      };

      Dispatcher.prototype.canDispatch = function() {
        return !this.currentspace.tileModel.isOccupied();
      };

      return Dispatcher;

    })();
    InitiativeQueue = (function(_super) {
      __extends(InitiativeQueue, _super);

      function InitiativeQueue() {
        _ref1 = InitiativeQueue.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      InitiativeQueue.prototype.current_index = 0;

      InitiativeQueue.prototype.type = 'InitiativeQueue';

      InitiativeQueue.prototype.turnDelay = 300;

      InitiativeQueue.prototype.initialize = function(models) {
        var _this = this;
        _.bindAll(this, "next", "prev", "getActive");
        this.on({
          "turndone": function() {
            board.mainCursor().hide();
            return this.next();
          },
          "die": function(model) {
            alert("" + (model.get('name')) + " died!");
            return _activebattle.checkEndOfBattle();
          }
        });
        return _.each(models, function(character) {
          return character.trigger("add", character, _this, {});
        });
      };

      InitiativeQueue.prototype.model = function(attrs, options) {
        var m;
        switch (attrs.type) {
          case 'player':
            m = new player.model(attrs, options);
            break;
          case 'npc':
            m = new NPC.NPC(attrs, options);
            break;
          case 'enemy':
            m = new Enemy(attrs, options);
        }
        m.queue = this;
        return m;
      };

      InitiativeQueue.prototype.comparator = function(model) {
        if (model.i) {
          return model.i;
        } else {
          model.i = model.get("init") + Math.ceil(Math.random() * _sm);
        }
        return model.i;
      };

      InitiativeQueue.prototype.getActive = function(opts) {
        var active;
        opts = _.extend({
          player: false
        }, opts);
        active = this.at(this.current_index);
        if (opts.player === true && active.isPC() === false) {
          return null;
        } else {
          return active;
        }
      };

      InitiativeQueue.prototype.next = function(init) {
        var active_player, num;
        num = this.current_index = ++this.current_index % this.length;
        active_player = this.getActive();
        while (active_player.isDead()) {
          active_player = this.getActive();
        }
        _activebattle.clearAllHighlights();
        if (active_player.isPC() && this.PCs.anyDispatched() === false) {
          events.trigger("showDispatchMenu");
        } else {
          if (init !== false) {
            setTimeout(function() {
              return active_player.initTurn();
            }, this.turnDelay);
          }
        }
        return num;
      };

      InitiativeQueue.prototype.prev = function() {
        this.current_index--;
        if (this.current_index < 0) {
          return this.current_index = this.length - 1;
        }
      };

      return InitiativeQueue;

    })(NPCArray);
    Timer = (function() {
      function Timer(el, number) {
        this.el = el;
        this.number = number;
      }

      Timer.prototype.interval = null;

      Timer.prototype.totaltime = 25000;

      Timer.prototype.stop = function() {
        if (this.interval) {
          return clearInterval(this.interval);
        }
      };

      Timer.prototype.start = function(extra, done) {
        var totaltime, value,
          _this = this;
        value = parseInt(this.el.attr("value"));
        extra || (extra = 0);
        totaltime = this.totaltime + extra * 100;
        this.el.attr("max", totaltime);
        return this.interval = setInterval(function() {
          var numpos;
          value += 50;
          _this.el.attr("value", value);
          numpos = ((totaltime - value) / totaltime) * 100 - 1;
          _this.number.text((Math.round((totaltime * .001 - value * .001) / .1) * .1).toFixed(1) + "s");
          if (numpos > 0) {
            _this.number.css("right", numpos + "%");
          }
          if (value >= totaltime) {
            clearInterval(_this.interval);
            globals.shared_events.trigger("battle:timerdone", getActive());
            if ((done != null) && _.isFunction(done)) {
              return done();
            }
          }
        }, 50);
      };

      Timer.prototype.reset = function() {
        this.stop();
        return this.el.attr("value", 0);
      };

      Timer.prototype.show = function() {
        board.$canvas.addClass("nocorners");
        this.el.slideDown("fast");
        return this.number.fadeIn("fast");
      };

      Timer.prototype.hide = function() {
        board.$canvas.removeClass("nocorners");
        this.number.fadeOut("fast");
        return this.el.slideUp("fast");
      };

      Timer.prototype.set = function(time) {
        if (time >= 0 && time <= this.totaltime) {
          return this.el.attr("value", time);
        }
      };

      return Timer;

    })();
    _timer = new Timer($("#turn-progress"), $("#turn-progress-number"));
    GridOverlay = (function(_super) {
      __extends(GridOverlay, _super);

      function GridOverlay() {
        _ref2 = GridOverlay.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      GridOverlay.prototype.show = function() {
        return this.$el.fadeIn("fast");
      };

      GridOverlay.prototype.hide = function() {
        return this.$el.fadeOut("fast");
      };

      GridOverlay.prototype.el = ".battle-grid-overlay";

      GridOverlay.prototype.showing = false;

      GridOverlay.prototype.initialize = function(_arg) {
        this.battle = _arg.battle, this.child = _arg.child, this.model = _arg.model;
        return GridOverlay.__super__.initialize.apply(this, arguments);
      };

      GridOverlay.prototype.render = function() {
        var _this = this;
        this.$el.empty();
        return _.each(this.model.children, function(row) {
          return _.each(row.children, function(tile) {
            var item;
            item = new GridSquare({
              model: tile.tileModel
            });
            item.parent = _this;
            tile.modifier = item;
            return _this.$el.append(item.render().el);
          });
        });
      };

      GridOverlay.prototype.toggle = function() {
        if (this.showing === false) {
          return this.activate();
        } else {
          return this.deactivate();
        }
      };

      GridOverlay.prototype.activate = function() {
        this.render();
        this.show();
        return this.showing = true;
      };

      GridOverlay.prototype.deactivate = function() {
        this.hide();
        return this.showing = false;
      };

      GridOverlay.prototype.virtualMove = function(dx, dy, start, opts) {
        var target;
        if (opts == null) {
          opts = {};
        }
        if (board.isPaused()) {
          return false;
        }
        target = mapper.getTargetTile(dx, dy, start);
        if (_.isEmpty(target)) {
          return false;
        }
        if (target.tileModel.discovered) {
          return false;
        }
        if (!target.tileModel.checkEnterable(dx, dy, start, opts)) {
          return false;
        }
        if (!target.tileModel.tooHigh(start, opts.jump)) {
          return false;
        }
        return target;
      };

      GridOverlay.prototype.virtualMovePossibilities = function(start, done, opts) {
        var checkQueue, enqueue, i, movable, path_defaults, square, tile, _i;
        done || (done = function(target) {
          return target.tileModel.trigger("potentialmove");
        });
        if (start === "dispatch") {
          start = mapper.getTargetTile(0, 0, this.battle.dispatcher.marker);
        }
        path_defaults = {
          diagonal: false,
          ignoreNPCs: false,
          ignorePCs: false,
          ignoreEmpty: false,
          ignoreDifficult: false,
          storePath: true,
          ignoreDeltas: false,
          range: 6,
          handlerContext: this,
          jump: 2
        };
        opts = _.extend(path_defaults, opts);
        checkQueue = [];
        movable = new mapper.Row;
        checkQueue.unshift(start);
        start.tileModel.discovered = true;
        start.tileModel.distance = 0;
        start.tileModel.pathFromStart.start = _.pick(start, "x", "y");
        enqueue = function(dx, dy, previous, target) {
          var d, distance, path, pathFromStart;
          if (target === false) {
            return;
          }
          distance = previous.distance;
          if (opts.storePath !== false) {
            path = ut.deep_clone(previous.pathFromStart.path);
            path.push({
              dx: dx,
              dy: dy
            });
            pathFromStart = target.tileModel.pathFromStart;
            pathFromStart.path = path;
            pathFromStart.start = previous.pathFromStart.start;
          }
          if (!target) {
            return;
          }
          d = target.m ? target.m : 1;
          if (opts.ignoreDifficult) {
            d = 1;
          }
          if (distance + d > opts.range) {
            return;
          } else {
            target.tileModel.distance = distance + d;
          }
          target.tileModel.discovered = true;
          checkQueue.unshift(target);
          return done.call(opts.handlerContext, target);
        };
        while (!(checkQueue.length <= 0)) {
          square = checkQueue.pop();
          tile = square.tileModel;
          movable.push(tile);
          for (i = _i = -1; _i <= 1; i = ++_i) {
            if (i === 0) {
              continue;
            }
            enqueue(0, i, square.tileModel, this.virtualMove(0, i, square, opts));
            enqueue(i, 0, square.tileModel, this.virtualMove(i, 0, square, opts));
            if (opts.diagonal === true) {
              enqueue(i, i, square.tileModel, this.virtualMove(i, i, square, opts));
              enqueue(-i, i, square.tileModel, this.virtualMove(-i, i, square, opts));
            }
          }
        }
        _.each(movable.models, function(tile) {
          return tile.discovered = false;
        });
        return movable;
      };

      return GridOverlay;

    })(Backbone.View);
    GridSquare = (function(_super) {
      __extends(GridSquare, _super);

      function GridSquare() {
        _ref3 = GridSquare.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      GridSquare.prototype.tagName = 'li';

      GridSquare.prototype.template = "&nbsp;";

      GridSquare.prototype.colors = {
        selected_move: "green",
        potential_move: "#ea0000",
        general: 'blue',
        burst: 'orange'
      };

      GridSquare.prototype.pulsing = true;

      GridSquare.prototype.initialize = function() {
        this.listenTo(this.model, {
          potentialmove: this.potentialmoves,
          removemove: function() {
            this.unbindMoveFns();
            return this.removehighlighting();
          },
          removeattackzone: function() {
            this.removehighlighting();
            return this.unbindAttackFns();
          },
          generalhighlight: this.highlight,
          rangeattack: this.attackrange,
          burstattack: this.burstattack
        });
        return this.setUpHitArea();
      };

      GridSquare.prototype.stopPulsing = function() {
        this.pulsing = false;
        this.model.bitmap.hitArea.alpha = .3;
        return this;
      };

      GridSquare.prototype.pulse = function() {
        var area, direction;
        direction = 1;
        this.pulsing = true;
        area = this.model.bitmap.hitArea;
        return this;
      };

      GridSquare.prototype.setUpHitArea = function() {
        var area, bitmap;
        bitmap = this.model.bitmap;
        area = bitmap.hitArea;
        area.drawn = false;
        area.x = bitmap.x;
        area.y = bitmap.y;
        area.alpha = .16;
        return this;
      };

      GridSquare.prototype.render = function() {
        this.model.square = this;
        this.$el.html(_.template(this.template, this.model.toJSON()));
        if (this.model.get("e") === "f") {
          this.$el.addClass("nogrid");
        }
        return this;
      };

      GridSquare.prototype.drawHitAreaSquare = function(color) {
        return this.model.bitmap.hitArea.graphics.clear().beginFill(color).drawRect(0, 0, _ts, _ts).endFill();
      };

      GridSquare.prototype.move_fns = {
        clickHandler: function(e, data) {
          var active_player, len, moveInterval, path,
            _this = this;
          if (this.moving === true) {
            return this;
          }
          active_player = getActive();
          path = this.model.pathFromStart.path;
          len = path.length;
          _timer.stop();
          this.moving = true;
          moveInterval = function() {
            var deltas;
            if (_.isEmpty(path)) {
              activity.emit("" + (active_player.get('type')) + " \"" + (active_player.get('name')) + "\" moved " + len + " squares");
              active_player.cursor().show();
              _this.stopListening(active_player, "donemoving");
              _this.moving = false;
              _activebattle.clearPotentialMoves();
              return active_player.takeMove();
            } else {
              deltas = path.shift();
              return active_player.moveInterval(deltas.dx, deltas.dy);
            }
          };
          moveInterval();
          return this.listenTo(active_player, "donemoving", function() {
            return setTimeout(moveInterval, 100);
          });
        },
        mouseoverHandler: function(e, data) {
          console.log("mouse");
          board.mainCursor().show().move(this.model.bitmap);
          this.drawHitAreaSquare(this.colors.selected_move);
          return this;
        },
        mouseoutHandler: function(e, data) {
          board.mainCursor().hide();
          this.drawHitAreaSquare(this.colors.potential_move);
          return this;
        }
      };

      GridSquare.prototype.attack_fns = {
        clickHandler: function(e, data) {
          var attacker, len, power, subject, targets,
            _this = this;
          power = this.model.boundPower;
          attacker = power.belongsTo();
          if (data.type === "burst") {
            targets = _activebattle.attack_zone.getOccupied({
              reject: function(subj) {
                return _.isEqual(subj.getOccupant(), attacker);
              }
            }).models;
            len = targets.length;
            _.each(targets, function(square, i) {
              var act;
              if (i === len - 1) {
                act = {
                  take_action: true
                };
              } else {
                act = {
                  take_action: false
                };
              }
              return setTimeout(function() {
                return _this.handleAttack(attacker, square.getOccupant(), power, act);
              }, (i + 1) * 700);
            });
          } else {
            subject = this.model.getOccupant();
          }
          if (subject == null) {
            return false;
          } else {
            return this.handleAttack(attacker, subject, power);
          }
        },
        mouseoverHandler: function(e, data) {
          this.drawHitAreaSquare(this.colors.selected_move);
          board.mainCursor().show().move(this.model.bitmap);
          if (this.model.isOccupied()) {
            return this.model.getOccupant().menu.showAttributeOverlay();
          }
        },
        mouseoutHandler: function(e, data) {
          this.drawHitAreaSquare(this.colors.general);
          board.mainCursor().hide();
          if (this.model.isOccupied()) {
            return this.model.getOccupant().menu.hideAttributeOverlay();
          }
        }
      };

      GridSquare.prototype.handleAttack = function(attacker, subject, power, opts) {
        var hit_details;
        if (opts == null) {
          opts = {
            take_action: true
          };
        }
        if (!attacker.can(power.get("action"))) {
          return this;
        }
        if (hit_details = power.use.call(power, subject, {
          take_action: opts.take_action
        })) {
          activity.emit(_.template(hit_template, {
            power: power,
            attacker: attacker,
            subject: subject,
            hit_details: hit_details
          }));
        }
        this.parent.battle.clearAttackZone();
        return this;
      };

      GridSquare.prototype.bindMoveFns = function() {
        var area, m;
        area = this.model.bitmap.hitArea;
        m = this.move_fns;
        area.on("click", m.clickHandler, this, false, {
          area: area
        });
        area.on("mouseover", m.mouseoverHandler, this, false, {
          area: area
        });
        area.on("mouseout", m.mouseoutHandler, this, false, {
          area: area
        });
        return this;
      };

      GridSquare.prototype.bindAttackFns = function(type) {
        var a, area;
        area = this.model.bitmap.hitArea;
        a = this.attack_fns;
        area.on("click", a.clickHandler, this, false, {
          area: area,
          type: type
        });
        area.on("mouseover", a.mouseoverHandler, this, false, {
          area: area,
          type: type
        });
        area.on("mouseout", a.mouseoutHandler, this, false, {
          area: area,
          type: type
        });
        return this;
      };

      GridSquare.prototype.highlight = function() {
        var area, bitmap, g;
        bitmap = this.model.bitmap;
        area = bitmap.hitArea;
        return g = area.graphics;
      };

      GridSquare.prototype.potentialmoves = function() {
        var area;
        area = this.model.bitmap.hitArea;
        this.drawHitAreaSquare(this.colors.potential_move);
        area.alpha = 0.3;
        area.drawn = true;
        this.bindMoveFns(area);
        stage.addChildAt(area, 0);
        return this;
      };

      GridSquare.prototype.unbindMoveFns = function() {};

      GridSquare.prototype.unbindAttackFns = function() {};

      GridSquare.prototype.unbindHitFns = function() {
        return this.model.bitmap.hitArea.removeAllEventListeners();
      };

      GridSquare.prototype.removehighlighting = function() {
        var area;
        area = this.model.bitmap.hitArea;
        this.unbindHitFns();
        area.drawn = false;
        area.alpha = 0;
        return this;
      };

      GridSquare.prototype.attackrange = function() {
        var area;
        area = this.model.bitmap.hitArea;
        this.drawHitAreaSquare(this.colors.general);
        area.alpha = 0.3;
        area.drawn = true;
        this.bindAttackFns();
        stage.addChildAt(area, 0);
        return this;
      };

      GridSquare.prototype.burstattack = function() {
        var area;
        area = this.model.bitmap.hitArea;
        this.drawHitAreaSquare(this.colors.burst);
        area.alpha = 0.3;
        area.drawn = true;
        this.bindAttackFns("burst");
        return stage.addChildAt(area, 0);
      };

      GridSquare.prototype.events = function() {
        return {
          "click": function() {
            return console.log("hitarea");
          },
          mouseover: function(e) {
            if (this.potentialmove) {
              return this.$el.addClass("selecting-move");
            }
          },
          mouseout: function() {
            if (this.potentialmove) {
              return this.$el.removeClass("selecting-move");
            }
          }
        };
      };

      return GridSquare;

    })(Backbone.View);
    getActive = function(opts) {
      return _activebattle.get("InitQueue").getActive(opts);
    };
    virtualMovePossibilities = function() {
      return _activebattle.virtualMovePossibilities.apply(_activebattle, arguments);
    };
    setPotentialMoves = function(squares) {
      return _activebattle.potential_moves = squares;
    };
    discardDispatch = function() {
      var dispatcher;
      dispatcher = _activebattle.dispatcher;
      if (dispatcher.canDispatch()) {
        if (dispatcher.potential_dispatch) {
          dispatcher.marker.removeChildAt(1);
          dispatcher.potential_dispatch = null;
        }
        return _activebattle.clearAllHighlights();
      }
    };
    getQueue = function() {
      return _activebattle.get("InitQueue");
    };
    _shared.on({
      "state:battle": function() {
        var grid;
        if (_activebattle) {
          _activebattle.destructor().destroy();
        }
        _activebattle = new Battle();
        console.log(mapper.getVisibleMap());
        debugger;
        grid = new GridOverlay({
          model: _activemap || mapper.getVisibleMap(),
          child: GridSquare,
          battle: _activebattle
        });
        _activebattle.grid = grid;
        _activebattle.begin("random");
        return _timer.show();
      },
      "map:change": function(map) {
        return _activemap = map;
      }
    });
    return window.battler = {
      getActive: function(opts) {
        return getActive(opts);
      },
      getPlayers: function() {
        return taskrunner.getParty();
      },
      getNPCs: function() {
        return _activebattle.get("NPCs");
      },
      getEnemies: function() {
        return _activebattle.get("NPCs");
      },
      toggleGrid: function() {
        _activemap = mapper.getVisibleMap(true);
        if (_activebattle) {
          return _activebattle.toggleGrid();
        }
      },
      activateGrid: function() {
        _activemap = mapper.getVisibleMap(true);
        if (_activebattle) {
          return _activebattle.activateGrid();
        }
      },
      deactivateGrid: function() {
        if (_activebattle) {
          return _activebattle.deactivateGrid();
        }
      },
      getQueue: function() {
        return getQueue();
      },
      showTimer: function() {
        _timer.show();
        return this;
      },
      hideTimer: function() {
        _timer.hide();
        return this;
      },
      setTimer: function(time) {
        _timer.set(time);
        return this;
      },
      startTimer: function(extra, done) {
        _timer.start(extra, done);
        return this;
      },
      stopTimer: function() {
        _timer.stop();
        return this;
      },
      resetTimer: function() {
        _timer.reset();
        return this;
      },
      setTotalTime: function(total) {
        _timer.setTotalTime();
        return this;
      },
      start: function() {
        var a;
        a = getActive().initTurn();
        return setTimeout(this.stopTimer(), 1000);
      },
      stop: function() {
        return board.removeState("battle").addState("travel");
      },
      randomBattle: function() {
        var b;
        if (_activebattle) {
          _activebattle.destroy();
        }
        _activebattle = b = new Battle();
        return b.randomize();
      },
      setState: function(state) {
        if (_activebattle) {
          _activebattle.setState(state.toUpperCase());
        }
        return this;
      },
      addState: function(newstate) {
        if (_activebattle) {
          _activebattle.addState(newstate.toUpperCase());
        }
        return this;
      },
      removeState: function(removeme) {
        removeme = removeme.toUpperCase();
        if (_activebattle.hasState(removeme)) {
          _activebattle.removeState(removeme);
        }
        return this;
      },
      toggleState: function(state) {
        if (_activebattle.hasState(state)) {
          return _activebattle.removeState(state);
        } else {
          return _activebattle.addState(state);
        }
      },
      setPotentialMoves: function(squares) {
        return setPotentialMoves(squares);
      },
      setAttacks: function(squares) {
        return _activebattle.attack_zone = squares;
      },
      clearPotentialMoves: function() {
        if (_activebattle) {
          return _activebattle.clearPotentialMoves();
        }
      },
      removeHighlighting: function() {
        if (_activebattle) {
          return _activebattle.clearAllHighlights();
        }
      },
      startPulsing: function() {
        if (_activebattle) {
          return _activebattle.pulseGrid();
        }
      },
      virtualMovePossibilities: function() {
        return virtualMovePossibilities.apply(this, arguments);
      },
      potentialDispatch: function(character) {
        var dispatcher;
        dispatcher = _activebattle.dispatcher;
        if (dispatcher.canDispatch()) {
          dispatcher.marker.addChildAt(character.marker, 1);
          dispatcher.potential_dispatch = character;
          return setPotentialMoves(virtualMovePossibilities("dispatch", null, {
            range: character.get("spd")
          }));
        }
      },
      discardDispatch: function() {
        discardDispatch();
        return this;
      },
      confirmDispatch: function() {
        var character, dispatcher, queue;
        dispatcher = _activebattle.dispatcher;
        if (dispatcher.canDispatch()) {
          ut.destroyModal();
          character = dispatcher.potential_dispatch;
          if (character) {
            discardDispatch();
            board.addMarker(character);
            queue = getQueue();
            queue.add(character, {
              at: queue.current_index
            });
            character.dispatch(dispatcher);
            queue.prev();
            queue.next();
          }
        }
        return this;
      },
      events: battle_events
    };
  });

}).call(this);
