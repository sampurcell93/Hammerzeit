(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "backbone", "jquery", "underscore"], function(globals, ut) {
    var Chunk, Overlay, OverlayItem, Row, Tile, applyChanges, applyDirs, applyElevation, exportMap, getArrayPos, getNextTile, modifyTileInfo, t, _chunk, _enterInfo, _ref, _ref1, _ref2, _ref3, _ref4;
    Tile = (function(_super) {
      __extends(Tile, _super);

      function Tile() {
        _ref = Tile.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Tile.prototype.defaults = {
        t: 'e',
        e: ''
      };

      Tile.prototype.initialize = function(attrs) {
        return this.set(attrs);
      };

      return Tile;

    })(Backbone.Model);
    Row = (function(_super) {
      __extends(Row, _super);

      function Row() {
        _ref1 = Row.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Row.prototype.model = Tile;

      return Row;

    })(Backbone.Collection);
    Chunk = (function(_super) {
      __extends(Chunk, _super);

      function Chunk() {
        _ref2 = Chunk.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      Chunk.prototype.defaults = function() {
        var i, j, row, rows, _i, _j, _ref3, _ref4;
        rows = [];
        for (i = _i = 0, _ref3 = globals.map.tileheight; 0 <= _ref3 ? _i < _ref3 : _i > _ref3; i = 0 <= _ref3 ? ++_i : --_i) {
          rows[i] = row = new Row;
          for (j = _j = 0, _ref4 = globals.map.tilewidth; 0 <= _ref4 ? _j < _ref4 : _j > _ref4; j = 0 <= _ref4 ? ++_j : --_j) {
            row.add(new Tile({
              t: 'e'
            }));
          }
        }
        return {
          rows: rows
        };
      };

      Chunk.prototype["export"] = function() {
        var str;
        str = "[";
        _.each(this.get("rows"), function(row) {
          str += "[";
          _.each(row.models, function(tile) {
            return str += JSON.stringify(tile.toJSON()) + ",";
          });
          str = str.substring(0, str.length - 1);
          return str += "],";
        });
        return str.substring(0, str.length - 1) + "]";
      };

      return Chunk;

    })(Backbone.Model);
    t = ut.tileEntryCheckers;
    _enterInfo = $("#modify-tile").html();
    _chunk = new Chunk;
    getArrayPos = function(x, y) {
      x /= 50;
      y /= 50;
      return {
        x: x,
        y: y
      };
    };
    getNextTile = function(x, y) {
      if (x < 19) {
        x++;
        return {
          tile: _chunk.get("rows")[y].at(x),
          y: y,
          x: x
        };
      } else if (x === 19 && y < 13) {
        y++;
        return {
          tile: _chunk.get("rows")[y].at(0),
          y: y,
          x: 0
        };
      } else {
        return null;
      }
    };
    applyDirs = function(tile, x, y) {
      var v;
      v = this.val();
      return tile.set("e", v);
    };
    applyElevation = function(tile, x, y) {
      var v;
      v = this.val();
      return tile.set("elv", parseInt(v));
    };
    applyChanges = function(modal, tile, x, y) {
      var next;
      applyDirs.call(modal.find(".js-add-dirs"), tile, x, y);
      applyElevation.call(modal.find(".js-add-elevation"), tile, x, y);
      ut.destroyModal();
      next = getNextTile(x, y);
      return modifyTileInfo(next.tile, next.x, next.y);
    };
    modifyTileInfo = function(tile, x, y) {
      var modal;
      if (tile == null) {
        return null;
      }
      modal = ut.launchModal("x: " + x + "<br />y: " + y + _.template(_enterInfo, tile.toJSON()));
      modal.find(".js-add-dirs").select();
      modal.on("keydown", ".js-add-dirs, .js-add-elevation", function(e) {
        var key;
        key = e.keyCode || e.which;
        if (key === 13) {
          return applyChanges(modal, tile, x, y);
        }
      });
      return tile;
    };
    Overlay = (function(_super) {
      __extends(Overlay, _super);

      function Overlay() {
        _ref3 = Overlay.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      Overlay.prototype.el = '.enterable-list';

      Overlay.prototype.initialize = function() {
        _.bindAll(this, "render");
        return this.render();
      };

      Overlay.prototype.render = function() {
        var _this = this;
        this.$el.empty();
        console.log(this.model);
        return _.each(this.model.get("rows"), function(row) {
          return _.each(row.models, function(tile) {
            var item;
            item = new OverlayItem({
              model: tile
            });
            return _this.$el.append(item.render().el);
          });
        });
      };

      return Overlay;

    })(Backbone.View);
    OverlayItem = (function(_super) {
      __extends(OverlayItem, _super);

      function OverlayItem() {
        _ref4 = OverlayItem.__super__.constructor.apply(this, arguments);
        return _ref4;
      }

      OverlayItem.prototype.template = "<%= typeof e !== 'undefined' && e ? e : 'e' %>";

      OverlayItem.prototype.tagName = 'li';

      OverlayItem.prototype.initialize = function() {
        return this.listenTo(this.model, {
          "change:e": this.render
        });
      };

      OverlayItem.prototype.render = function() {
        this.$el.html(_.template(this.template, this.model.toJSON()));
        return this;
      };

      return OverlayItem;

    })(Backbone.View);
    exportMap = function() {
      var m;
      _.each(_chunk.get("rows"), function(row) {
        return _.each(row.models, function(tile) {
          if (!tile.get("elv")) {
            return tile.set("elv", 0);
          }
        });
      });
      m = ut.launchModal("<textarea>" + _chunk["export"]() + "</textarea>");
      m.find("textarea").select();
      return new Overlay({
        model: _chunk
      });
    };
    return {
      getDefaultChunk: function() {
        return new Chunk;
      },
      bindCreators: function(tile) {
        if (globals.dev) {
          tile.addEventListener("click", function() {
            var coords;
            ut.c(tile);
            coords = getArrayPos(tile.x, tile.y);
            return modifyTileInfo(_chunk.get("rows")[coords.y].at(coords.x), coords.x, coords.y);
          });
          return tile.addEventListener("pressmove", function() {
            return exportMap();
          });
        }
      },
      loadChunk: function(precursor_chunk) {
        var allRows, chunk;
        chunk = new Chunk;
        allRows = [];
        _.each(precursor_chunk, function(row, i) {
          var rowCollection;
          rowCollection = new Row;
          _.each(row, function(tile) {
            return rowCollection.add(new Tile(tile));
          });
          return allRows[i] = rowCollection;
        });
        chunk.set("rows", allRows);
        return _chunk = chunk;
      },
      exportMap: function() {
        return exportMap();
      },
      modifyTileInfo: function(tile, x, y) {
        return modifyTileInfo(tile);
      }
    };
  });

}).call(this);
