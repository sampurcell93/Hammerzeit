(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["board", "globals", "utilities", "mapper", "npc", "mapcreator", "player", "backbone", "underscore", "jquery"], function(board, globals, ut, mapper, NPC, mapcreator, player) {
    var GridSquare, Overlay, activateGrid, deactivateGrid, toggleGrid, _activemap, _board, _grid, _gridded, _ref, _ref1, _shared;
    _shared = globals.shared_events;
    _shared.on("battle", function() {
      return activateGrid();
    });
    _grid = null;
    _gridded = false;
    _activemap = null;
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

      GridSquare.prototype.initialize = function() {
        return this.listenTo(this.model, {
          potentialmove: function() {
            this.potentialmove = true;
            return this.highlight();
          },
          unhighlight: function() {
            this.unhighlight;
            return this.removepotential();
          }
        });
      };

      GridSquare.prototype.render = function() {
        this.model.square = this;
        this.$el.html(_.template(this.template, this.model.toJSON()));
        return this;
      };

      GridSquare.prototype.highlight = function(type) {
        return this.$el.addClass("highlight-" + (type || "potentialmove"));
      };

      GridSquare.prototype.unhighlight = function() {
        var classes;
        classes = this.$el.attr("class").split(" ");
        this.$el.removeClass();
        _.each(classes, function(cl) {
          if (cl.indexOf("highlight") !== -1) {
            return cl = "";
          }
        });
        return this.$el.addClass(classes.join(" "));
      };

      GridSquare.prototype.removepotential = function() {
        return this.potentialmove = false;
      };

      GridSquare.prototype.events = function() {
        return {
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
      if (!_grid) {
        _grid = new Overlay({
          model: _activemap,
          el: ".battle-grid-overlay",
          child: GridSquare
        });
      } else {
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
