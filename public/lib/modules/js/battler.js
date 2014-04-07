(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["board", "globals", "utilities", "mapper", "npc", "mapcreator", "player", "backbone", "underscore", "jquery"], function(board, globals, ut, mapper, NPC, mapcreator, player) {
    var Battle, Enemy, GridOverlay, GridSquare, InitiativeQueue, NPCArray, PCs, Player, Timer, getActive, map, stage, states, _active_chars, _activebattle, _activemap, _b, _grid, _ref, _ref1, _ref2, _ref3, _shared, _sm, _timer, _ts;
    PCs = player.PCs;
    Player = player.model;
    NPCArray = NPC.NPCArray;
    Enemy = NPC.Enemy;
    NPC = NPC.NPC;
    stage = board.getStage();
    map = globals.map;
    _sm = 20;
    _ts = globals.map.tileside;
    states = ['choosingmoves', 'choosingattacks', 'menuopen'];
    InitiativeQueue = (function(_super) {
      __extends(InitiativeQueue, _super);

      function InitiativeQueue() {
        _ref = InitiativeQueue.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      InitiativeQueue.prototype.current_index = 0;

      InitiativeQueue.prototype.type = 'InitiativeQueue';

      InitiativeQueue.prototype.turnDelay = 1000;

      InitiativeQueue.prototype.initialize = function(models) {
        var _this = this;
        _.bindAll(this, "next", "prev", "getActive");
        this.on({
          "turndone": function() {
            board.mainCursor().hide();
            return this.next();
          },
          "die": function(model) {
            console.log("" + (model.get('name')) + " died (in InitiativeQueue listener)");
            _this.remove(model);
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
            m = new NPC(attrs, options);
            break;
          case 'enemy':
            m = new Enemy(attrs, options);
        }
        m.queue = this;
        return m;
      };

      InitiativeQueue.prototype.comparator = function(model) {
        return -model.get("type") === "PC";
      };

      InitiativeQueue.prototype.getActive = function(opts) {
        var active;
        opts = _.extend({
          player: false
        }, opts);
        active = this.at(this.current_index);
        if (opts.player === true && active instanceof player.model === false) {
          return null;
        } else {
          return active;
        }
      };

      InitiativeQueue.prototype.next = function(init) {
        var active_player, num;
        num = this.current_index = ++this.current_index % this.length;
        active_player = this.getActive();
        _activebattle.clearAllHighlights();
        if (init !== false) {
          setTimeout(function() {
            return active_player.initTurn();
          }, this.turnDelay);
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
    Battle = (function(_super) {
      __extends(Battle, _super);

      function Battle() {
        _ref1 = Battle.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Battle.prototype.states = [];

      Battle.prototype.defaults = {
        NPCs: new NPCArray,
        InitQueue: new InitiativeQueue(PCs.models),
        avglevel: PCs.getAverageLevel(),
        numenemies: 1,
        enemyBounds: {
          min_x: 0,
          max_x: map.c_width,
          min_y: 0,
          max_y: map.c_height
        }
      };

      Battle.prototype.initialize = function() {
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
        this.trigger("newstate");
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
          throw new Error("The board currently has only one state - you can't remove it. Try adding another state first.");
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
            if (character.dead === false) {
              return flag = false;
            }
          });
          return flag;
        }
        return false;
      };

      Battle.prototype.addPCs = function() {
        return _.each(PCs.models, function(pc, i) {
          pc.addToMap();
          globals.shared_events.trigger("bindmenu", pc);
          return board.addMarker(pc);
        });
      };

      Battle.prototype.begin = function(type, opts) {
        this.addPCs();
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
        var i, n, _i, _ref2;
        o = _.extend(this.defaults, o);
        for (i = _i = 0, _ref2 = o.numenemies; 0 <= _ref2 ? _i < _ref2 : _i > _ref2; i = 0 <= _ref2 ? ++_i : --_i) {
          this.get("NPCs").add(n = new Enemy({
            level: o.avglevel
          }));
          this.get("InitQueue").add(n);
          n.addToMap();
          globals.shared_events.trigger("bindmenu", n);
          board.addMarker(n);
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
          return tile.trigger("removemove");
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
        console.log(NPCArr, PCArr);
        if (NPCArr.length === 0) {
          return alert("you won!");
        } else if (PCArr.length === 0) {
          return alert("they won :/");
        }
      };

      return Battle;

    })(Backbone.Model);
    _activebattle = new Battle;
    _active_chars = PCs;
    _shared = globals.shared_events;
    _shared.on("battle", function() {
      var b;
      _activebattle.destructor().destroy();
      b = _activebattle = new Battle;
      b.begin("random");
      return _grid.activate();
    });
    _activemap = null;
    _ts = globals.map.tileside;
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
            globals.shared_events.trigger("timerdone");
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

      GridOverlay.prototype.modifyAllTiles = function() {};

      GridOverlay.prototype.render = function() {
        GridOverlay.__super__.render.apply(this, arguments);
        console.log("rendering");
        return console.log(this.model);
      };

      GridOverlay.prototype.toggle = function() {
        if (this.showing === false) {
          return this.activate();
        } else {
          return this.deactivate();
        }
      };

      GridOverlay.prototype.activate = function() {
        this.model = _activemap;
        this.render();
        this.show();
        return this.showing = true;
      };

      GridOverlay.prototype.deactivate = function() {
        this.hide();
        return this.showing = false;
      };

      return GridOverlay;

    })(mapcreator.Overlay);
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
        general: 'blue'
      };

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
          attackrange: this.attackrange
        });
        return this.setUpHitArea();
      };

      GridSquare.prototype.setUpHitArea = function() {
        var area, bitmap;
        bitmap = this.model.bitmap;
        area = bitmap.hitArea;
        area.x = bitmap.x;
        area.y = bitmap.y;
        return this;
      };

      GridSquare.prototype.render = function() {
        this.model.square = this;
        this.$el.html(_.template(this.template, this.model.toJSON()));
        return this;
      };

      GridSquare.prototype.drawHitAreaSquare = function(color) {
        return this.model.bitmap.hitArea.graphics.clear().beginFill(color).drawRect(0, 0, _ts, _ts).endFill();
      };

      GridSquare.prototype.move_fns = {
        clickHandler: function(e, data) {
          var active, moveInterval, path,
            _this = this;
          active = getActive();
          path = this.model.pathFromStart.path;
          _timer.stop();
          moveInterval = function() {
            var deltas;
            if (_.isEmpty(path)) {
              _this.stopListening(active, "donemoving");
              _activebattle.clearPotentialMoves();
              return active.takeMove();
            } else {
              deltas = path.shift();
              return active.moveInterval(deltas.dx, deltas.dy);
            }
          };
          moveInterval();
          return this.listenTo(active, "donemoving", function() {
            return setTimeout(moveInterval, 100);
          });
        },
        mouseoverHandler: function(e, data) {
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
          var attacker, power, subject;
          power = this.model.boundPower;
          attacker = power.ownedBy;
          subject = this.model.bitmap.occupiedBy;
          if (subject == null) {
            return "Trying to attack an empty square";
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

      GridSquare.prototype.handleAttack = function(attacker, subject, power) {
        var attrs, use;
        attrs = power.toJSON();
        if (!attacker.can(attrs.action)) {
          return this;
        }
        use = attrs.use;
        if (_.isFunction(use)) {
          use.call(power, subject, attacker);
        }
        subject.takeDamage(attrs.damage + ut.roll(attrs.modifier));
        attacker.useCreatine(attrs.creatine);
        attacker.takeAction(attrs.action);
        power.use();
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
        return area.on("mouseout", m.mouseoutHandler, this, false, {
          area: area
        });
      };

      GridSquare.prototype.bindAttackFns = function() {
        var a, area;
        area = this.model.bitmap.hitArea;
        a = this.attack_fns;
        area.on("click", a.clickHandler, this, false, {
          area: area
        });
        area.on("mouseover", a.mouseoverHandler, this, false, {
          area: area
        });
        return area.on("mouseout", a.mouseoutHandler, this, false, {
          area: area
        });
      };

      GridSquare.prototype.highlight = function() {
        var area, bitmap, g;
        console.log("highlighting");
        console.log(arguments);
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
        var bitmaphit;
        bitmaphit = this.model.bitmap.hitArea;
        this.unbindHitFns();
        bitmaphit.drawn = false;
        return bitmaphit.alpha = 0;
      };

      GridSquare.prototype.attackrange = function() {
        var area;
        console.log("attack range at" + this.model.x, this.model.y);
        area = this.model.bitmap.hitArea;
        this.drawHitAreaSquare(this.colors.general);
        area.alpha = 0.3;
        area.drawn = true;
        this.bindAttackFns();
        stage.addChildAt(area, 0);
        return this;
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
    _grid = new GridOverlay({
      child: GridSquare
    });
    getActive = function(opts) {
      return _activebattle.get("InitQueue").getActive(opts);
    };
    _b = window.battler = {
      getActive: function(opts) {
        return getActive(opts);
      },
      toggleGrid: function() {
        console.log("calling toggle grid from");
        console.log(arguments.callee.caller.name);
        _activemap = mapcreator.getChunk();
        return _grid.toggle();
      },
      activateGrid: function() {
        console.log("calling toggle grid from");
        console.log(arguments.callee.caller.name);
        _activemap = mapcreator.getChunk();
        return _grid.activate();
      },
      deactivateGrid: function() {
        return _grid.deactivate();
      },
      getActiveMap: function() {
        return _activemap;
      },
      getQueue: function() {
        return _activebattle.get("InitQueue");
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
      stop: function() {},
      randomBattle: function() {
        var b;
        if (_activebattle) {
          _activebattle.destroy();
        }
        _activebattle = b = new Battle();
        return b.randomize();
      },
      setState: function(state) {
        _activebattle.setState(state.toUpperCase());
        return this;
      },
      addState: function(newstate) {
        _activebattle.addState(newstate.toUpperCase());
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
        return _activebattle.potential_moves = squares;
      },
      setAttacks: function(squares) {
        return _activebattle.attack_zone = squares;
      },
      clearPotentialMoves: function() {
        return _activebattle.clearPotentialMoves();
      },
      removeHighlighting: function() {
        return _activebattle.clearAllHighlights();
      }
    };
    window.t = function() {
      return _activebattle.get("InitQueue").getActive().turnDone();
    };
    return _b;
  });

}).call(this);
