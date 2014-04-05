(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["board", "globals", "utilities", "mapper", "npc", "mapcreator", "player", "backbone", "underscore", "jquery"], function(board, globals, ut, mapper, NPC, mapcreator, player) {
    var ActivityQueue, Battle, GridOverlay, GridSquare, NPCArray, PCs, Timer, clearPotentialMoves, getActive, map, stage, _active_chars, _activebattle, _activemap, _b, _grid, _potential_moves, _ref, _ref1, _ref2, _ref3, _shared, _sm, _timer, _ts;
    PCs = player.PCs;
    NPCArray = NPC.NPCArray;
    NPC = NPC.NPC;
    stage = board.getStage();
    map = globals.map;
    _sm = 20;
    _ts = globals.map.tileside;
    _potential_moves = null;
    ActivityQueue = (function(_super) {
      __extends(ActivityQueue, _super);

      function ActivityQueue() {
        _ref = ActivityQueue.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ActivityQueue.prototype.current_index = 0;

      ActivityQueue.prototype.type = 'ActivityQueue';

      ActivityQueue.prototype.initialize = function(models) {
        var _this = this;
        _.bindAll(this, "next", "prev", "getActive");
        this.on({
          "turndone": this.next
        });
        return _.each(models, function(character) {
          return character.trigger("add", character, _this, {});
        });
      };

      ActivityQueue.prototype.model = function(attrs, options) {
        var m;
        switch (attrs.type) {
          case 'player':
            m = new player.model(attrs, options);
            break;
          case 'npc':
            m = new NPC(attrs, options);
        }
        m.queue = this;
        return m;
      };

      ActivityQueue.prototype.comparator = function(model) {
        return -model.get("type") === "PC";
      };

      ActivityQueue.prototype.getActive = function(opts) {
        var active;
        opts = _.extend({
          player: false
        }, opts);
        active = this.at(this.current_index);
        console.log(this);
        console.log(active);
        debugger;
        if (opts.player === true && active instanceof player.model === false) {
          return null;
        } else {
          return active;
        }
      };

      ActivityQueue.prototype.next = function(init) {
        var num;
        num = this.current_index = ++this.current_index % this.length;
        console.log(this.getActive());
        if (init !== false) {
          this.getActive().initTurn();
        }
        return num;
      };

      ActivityQueue.prototype.prev = function() {
        this.current_index--;
        if (this.current_index < 0) {
          return this.current_index = this.length - 1;
        }
      };

      return ActivityQueue;

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
        AllCharacters: new ActivityQueue(PCs.models),
        avglevel: PCs.getAverageLevel(),
        numenemies: Math.ceil(Math.random() * PCs.length * 2 + 1),
        enemyBounds: {
          min_x: 0,
          max_x: map.c_width,
          min_y: 0,
          max_y: map.c_height
        }
      };

      Battle.prototype.addState = function(newstate) {
        if (this.hasState(newstate) === false) {
          return this.states.push(newstate);
        }
      };

      Battle.prototype.setState = function(newstate) {
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

      Battle.prototype.initialize = function() {
        return this.listenTo(this.get("NPCs"), {
          die: this.checkStillLiving
        });
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
          if (i !== 0) {
            pc.addToMap();
            return board.addMarker(pc);
          }
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
          this.get("NPCs").add(n = new NPC({
            level: o.avglevel
          }));
          this.get("AllCharacters").add(n);
          n.addToMap();
          board.addMarker(n);
        }
        this.get("AllCharacters").sort();
        return this;
      };

      Battle.prototype.destroy = function() {
        this.destructor();
        return Battle.__super__.destroy.apply(this, arguments);
      };

      Battle.prototype.destructor = function() {
        var NPCs, npc, _results;
        NPCs = this.get("NPCs");
        _results = [];
        while (npc = NPCs.first()) {
          npc.leaveSquare();
          stage.removeChild(npc.marker);
          _results.push(npc.destroy());
        }
        return _results;
      };

      return Battle;

    })(Backbone.Model);
    _activebattle = new Battle;
    _active_chars = PCs;
    _shared = globals.shared_events;
    _shared.on("battle", function() {
      var b;
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

      Timer.prototype.totaltime = 10000;

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
          removemove: this.removepotential,
          generalhighlight: this.highlight
        });
        return this.setUpHitArea();
      };

      GridSquare.prototype.setUpHitArea = function() {
        var area, bitmap, o;
        o = Math.ceil(this.model.get("elv") / 5);
        if (o < -5) {
          o = -5;
        } else if (o > 5) {
          o = 5;
        }
        bitmap = this.model.bitmap;
        bitmap.x += o;
        bitmap.y += o;
        area = bitmap.hitArea;
        area.x = bitmap.x - 1;
        area.y = bitmap.y - 1;
        return this;
      };

      GridSquare.prototype.render = function() {
        this.model.square = this;
        this.$el.html(_.template(this.template, this.model.toJSON()));
        return this;
      };

      GridSquare.prototype.clickHandler = function(e, data) {
        var active, moveInterval, path,
          _this = this;
        console.log("you clicked the area");
        console.log(arguments);
        console.log(this.model);
        active = getActive();
        path = this.model.pathFromStart.path;
        moveInterval = function() {
          var deltas, dx, dy;
          if (_.isEmpty(path)) {
            _this.stopListening(active, "donemoving");
            clearPotentialMoves();
            _potential_moves = active.virtualMovePossibilities();
            return active.takeMove();
          } else {
            deltas = path[0];
            dx = deltas.dx;
            dy = deltas.dy;
            active.moveInterval(dx, dy);
            return path.shift();
          }
        };
        moveInterval();
        return this.listenTo(active, "donemoving", function() {
          return setTimeout(moveInterval, 70);
        });
      };

      GridSquare.prototype.mouseoverHandler = function(e, data) {
        data.area.graphics.clear().beginFill(this.colors.selected_move).drawRect(0, 0, _ts, _ts).endFill();
        board.mainCursor().show().move(this.model.bitmap);
        return this;
      };

      GridSquare.prototype.mouseoutHandler = function(e, data) {
        board.mainCursor().hide();
        data.area.graphics.clear().beginFill(this.colors.potential_move).drawRect(0, 0, _ts, _ts).endFill();
        return this;
      };

      GridSquare.prototype.bindMoveFns = function(area) {
        area.on("click", this.clickHandler, this, false, {
          area: area
        });
        area.on("mouseover", this.mouseoverHandler, this, false, {
          area: area
        });
        return area.on("mouseout", this.mouseoutHandler, this, false, {
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
        var area, bitmap, g;
        console.log("highlighting potential");
        this.haspotentialmoves = true;
        bitmap = this.model.bitmap;
        area = bitmap.hitArea;
        g = area.graphics;
        g.clear().beginFill(this.colors.potential_move).drawRect(0, 0, _ts, _ts).endFill();
        area.alpha = 0.3;
        area.drawn = true;
        this.bindMoveFns(area);
        stage.addChildAt(area, 0);
        this;
        return console.log(area);
      };

      GridSquare.prototype.removepotential = function() {
        var bitmaphit;
        this.haspotentialmoves = false;
        bitmaphit = this.model.bitmap.hitArea;
        bitmaphit.drawn = false;
        bitmaphit.off("click");
        return stage.removeChild(bitmaphit);
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
      return _activebattle.get("AllCharacters").getActive(opts);
    };
    clearPotentialMoves = function() {
      if (_potential_moves == null) {
        return this;
      }
      _.each(_potential_moves.models, function(tile) {
        return tile.trigger("removemove");
      });
      return this;
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
        return _activebattle.get("AllCharacters");
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
        a = getActive();
        console.log(a.toJSON().name);
        return a.initTurn();
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
      setPotentialMoves: function(moves) {
        return _potential_moves = moves;
      },
      clearPotentialMoves: function() {
        return clearPotentialMoves();
      }
    };
    window.t = function() {
      var b;
      b = _b.getActive();
      b.trigger("turndone");
      return b;
    };
    return _b;
  });

}).call(this);
