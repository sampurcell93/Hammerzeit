(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["board", "globals", "utilities", "mapper", "npc", "mapcreator", "player", "backbone", "underscore", "jquery"], function(board, globals, ut, mapper, NPC, mapcreator, player) {
    var GridSquare, Overlay, activateGrid, deactivateGrid, stage, toggleGrid, _activemap, _board, _grid, _gridded, _ref, _ref1, _shared, _side;
    _shared = globals.shared_events;
    _shared.on("battle", function() {
      return activateGrid();
    });
    _grid = null;
    _gridded = false;
    _activemap = null;
    stage = board.getStage();
    _side = globals.map.tileside;
    Overlay = (function(_super) {
      __extends(Overlay, _super);

      function Overlay() {
        _ref = Overlay.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Overlay.prototype.show = function() {
        return this.$el.fadeIn("fast");
      };

      Overlay.prototype.hide = function() {
        return this.$el.fadeOut("fast");
      };

      Overlay.prototype.modifyAllTiles = function() {};

      return Overlay;

    })(mapcreator.Overlay);
    GridSquare = (function(_super) {
      __extends(GridSquare, _super);

      function GridSquare() {
        _ref1 = GridSquare.__super__.constructor.apply(this, arguments);
        return _ref1;
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
    _board = null;
    toggleGrid = function() {
      if (_gridded === false) {
        return activateGrid();
      } else {
        return deactivateGrid();
      }
    };
    activateGrid = function() {
      _activemap = mapcreator.getChunk();
      console.log(_activemap);
      if (!_grid) {
        _grid = new Overlay({
          model: _activemap,
          el: ".battle-grid-overlay",
          child: GridSquare
        });
      } else {
        _grid.model = _activemap;
        _grid.render();
        _grid.show();
      }
      return _gridded = true;
    };
    deactivateGrid = function() {
      _grid.hide();
      return _gridded = false;
    };
    return {
      loadBoard: function(board) {
        return _board = board;
      },
      getActivePlayer: function() {
        return player.PC;
      },
      addNPC: function(NPC, x, y) {},
      toggleGrid: function() {
        return toggleGrid();
      },
      activateGrid: function() {
        return activateGrid();
      },
      deactivateGrid: function() {
        return deactivateGrid();
      },
      getActiveMap: function() {
        console.log("getting activemap");
        console.log(_activemap);
        return _activemap;
      }
    };
  });

}).call(this);
