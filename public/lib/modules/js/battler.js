(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["board", "globals", "utilities", "mapper", "npc", "mapcreator", "player", "backbone", "underscore", "jquery"], function(board, globals, ut, mapper, NPC, mapcreator, player) {
    var ActivityQueue, Battle, GridOverlay, GridSquare, NPCArray, PCs, Timer, map, stage, _active_chars, _activemap, _currentbattle, _grid, _ref, _ref1, _ref2, _ref3, _shared, _side, _sm, _timer;
    PCs = player.PCs;
    NPCArray = NPC.NPCArray;
    NPC = NPC.NPC;
    stage = board.getStage();
    map = globals.map;
    _sm = 20;
    ActivityQueue = (function(_super) {
      __extends(ActivityQueue, _super);

      function ActivityQueue() {
        _ref = ActivityQueue.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ActivityQueue.prototype.current_index = 0;

      ActivityQueue.prototype.model = {
        model: function(attrs, options) {
          switch (attrs.type) {
            case 'player':
              return new player.model(attrs, options);
            case 'npc':
              return new NPC(attrs, options);
          }
        }
      };

      ActivityQueue.prototype.comparator = function(model) {
        return model.get("init") + Math.ceil(Math.random() * _sm);
      };

      return ActivityQueue;

    })(NPCArray);
    Battle = (function(_super) {
      __extends(Battle, _super);

      function Battle() {
        _ref1 = Battle.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Battle.prototype.battleDir = globals.battle_dir;

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

      Battle.prototype.begin = function() {};

      Battle.prototype.load = function(id) {
        return $.getJSON(this.battle_dir + id, function(battle) {
          return console.log(battle);
        });
      };

      Battle.prototype.randomize = function(o) {
        var i, n, _i, _ref2;
        o = _.extend(this.defaults, o);
        console.log(this);
        for (i = _i = 0, _ref2 = o.numenemies; 0 <= _ref2 ? _i < _ref2 : _i > _ref2; i = 0 <= _ref2 ? ++_i : --_i) {
          this.get("NPCs").add(n = new NPC({
            level: o.avglevel
          }));
          this.get("AllCharacters").add(n);
          n.addToMap();
          board.addMarker(n);
        }
        ut.c("before sort");
        console.log(this.get("AllCharacters").models);
        this.get("AllCharacters").sort();
        ut.c("after sort");
        console.log(this.get("AllCharacters").models);
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
    _active_chars = PCs;
    console.log(_active_chars);
    _shared = globals.shared_events;
    _shared.on("battle", function() {
      _grid.activate();
      ut.c("battle starting");
      return _.each(PCs.models, function(pc, i) {
        if (i !== 0) {
          pc.addToMap();
          return board.addMarker(pc);
        }
      });
    });
    _activemap = null;
    _side = globals.map.tileside;
    _currentbattle = null;
    Timer = (function() {
      function Timer(el, number) {
        this.el = el;
        this.number = number;
      }

      Timer.prototype.interval = null;

      Timer.prototype.totaltime = 20000;

      Timer.prototype.stop = function() {
        if (this.interval) {
          return clearInterval(this.interval);
        }
      };

      Timer.prototype.start = function() {
        var value,
          _this = this;
        this.show();
        value = parseInt(this.el.attr("value"));
        this.number.text((this.totaltime * .001 - value * .001) + "s");
        return this.interval = setInterval(function() {
          value += 50;
          _this.el.attr("value", value);
          if (value % 1000 === 0) {
            _this.number.text((_this.totaltime * .001 - value * .001) + "s");
          }
          if (value >= _this.totaltime) {
            clearInterval(_this.interval);
            return globals.shared_events.trigger("timerdone");
          }
        }, 50);
      };

      Timer.prototype.reset = function() {
        this.stop();
        return this.el.attr("value", 0);
      };

      Timer.prototype.show = function() {
        board.$canvas.addClass("nocorners");
        this.el.fadeIn("fast");
        return this.number.fadeIn("fast");
      };

      Timer.prototype.hide = function() {
        board.$canvas.removeClass("nocorners");
        this.number.fadeOut("fast");
        return this.el.fadeOut("fast");
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
        potential_move: "#ea0000"
      };

      GridSquare.prototype.initialize = function() {
        return this.listenTo(this.model, {
          potentialmove: this.potentialmoves,
          removemove: this.removepotential
        });
      };

      GridSquare.prototype.render = function() {
        this.model.square = this;
        this.$el.html(_.template(this.template, this.model.toJSON()));
        return this;
      };

      GridSquare.prototype.clickHandler = function(e, data) {
        console.log("you clicked the area");
        return console.log(arguments);
      };

      GridSquare.prototype.mouseoverHandler = function(e, data) {
        return data.area.graphics.clear().beginFill(this.colors.selected_move).drawRect(0, 0, _side - 2, _side - 2).endFill();
      };

      GridSquare.prototype.mouseoutHandler = function(e, data) {
        return data.area.graphics.clear().beginFill(this.colors.potential_move).drawRect(0, 0, _side - 2, _side - 2).endFill();
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

      GridSquare.prototype.potentialmoves = function() {
        var area, bitmap, g;
        console.log("highlighting potential");
        this.$el.addClass("potentialmove");
        this.potentialmoves = true;
        bitmap = this.model.bitmap;
        area = bitmap.hitArea;
        if (area.drawn != null) {
          stage.addChildAt(area, 0);
          return this;
        }
        area.drawn = true;
        g = area.graphics;
        area.x = bitmap.x - 1;
        area.y = bitmap.y - 1;
        g.clear().beginFill(this.colors.potential_move).drawRect(0, 0, _side - 2, _side - 2).endFill();
        area.alpha = 0.3;
        this.bindMoveFns(area);
        stage.addChildAt(area, 0);
        this;
        return console.log(area);
      };

      GridSquare.prototype.removepotential = function() {
        var bitmaphit;
        this.$el.removeClass("potentialmove");
        this.potentialmoves = false;
        bitmaphit = this.model.bitmap.hitArea;
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
    return window.battler = {
      getActivePlayer: function() {
        return player.PC;
      },
      toggleGrid: function() {
        _activemap = mapcreator.getChunk();
        return _grid.toggle();
      },
      activateGrid: function() {
        _activemap = mapcreator.getChunk();
        return _grid.activate();
      },
      deactivateGrid: function() {
        return _grid.deactivate();
      },
      getActiveMap: function() {
        return _activemap;
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
      startTimer: function() {
        _timer.start();
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
      Battle: Battle,
      randomBattle: function() {
        var b;
        if (_currentbattle) {
          _currentbattle.destroy();
        }
        _currentbattle = b = new Battle();
        return b.randomize();
      }
    };
  });

}).call(this);
