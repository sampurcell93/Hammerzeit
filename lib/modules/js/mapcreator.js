(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "mapper", "backbone", "jquery", "jquery-ui", "underscore"], function(globals, ut, mapper) {
    var Chunk, Overlay, OverlayItem, Row, Tile, exportMap, getNextTile, t, toggleOverlay, _chunk, _enterInfo, _overlay, _ref, _ref1, _ref2, _ref3, _ref4, _selected;
    t = ut.tileEntryCheckers;
    _enterInfo = $("#modify-tile").html();
    _overlay = null;
    Tile = (function(_super) {
      __extends(Tile, _super);

      function Tile() {
        _ref = Tile.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Tile.prototype.defaults = {
        t: 'e',
        e: '',
        elv: 0
      };

      Tile.prototype.initialize = function(attrs) {
        this.on("expose", this.expose);
        attrs.x = this.x;
        return attrs.y = this.y;
      };

      Tile.prototype.expose = function() {
        return mapper.setTile(this.attributes);
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
    window._selected = _selected = new Row;
    $(".enterable-list").selectable({
      selecting: function(e, ui) {
        ut.c("selecting via drag");
        return $(ui.selecting).trigger("select");
      },
      unselecting: function(e, ui) {
        ut.c("unselecting via drag");
        return $(ui.unselecting).trigger("unselect");
      },
      stop: function(e, ui) {
        ut.c("stop and modify");
        ut.c;
        return $(ui.selected).trigger("modification");
      },
      filter: 'li',
      delay: 100
    });
    Chunk = (function(_super) {
      __extends(Chunk, _super);

      function Chunk() {
        _ref2 = Chunk.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      Chunk.prototype.defaults = function() {
        var i, j, row, rows, tile, _i, _j, _ref3, _ref4;
        rows = [];
        for (i = _i = 0, _ref3 = globals.map.tileheight; 0 <= _ref3 ? _i < _ref3 : _i > _ref3; i = 0 <= _ref3 ? ++_i : --_i) {
          rows[i] = row = new Row;
          for (j = _j = 0, _ref4 = globals.map.tilewidth; 0 <= _ref4 ? _j < _ref4 : _j > _ref4; j = 0 <= _ref4 ? ++_j : --_j) {
            row.add(tile = new Tile({
              t: 'e'
            }));
            tile.x = j;
            tile.y = i;
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
    _chunk = new Chunk;
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
        return _.each(this.model.get("rows"), function(row) {
          return _.each(row.models, function(tile) {
            var item;
            item = new OverlayItem({
              model: tile
            });
            item.parent = _this;
            tile.modifier = item;
            return _this.$el.append(item.render().el);
          });
        });
      };

      Overlay.prototype.modifyAllTiles = function(modal) {
        ut.c("modding all", _selected);
        _.each(_selected.models, function(tile) {
          return tile.modifier.applyChanges(modal, false);
        });
        return _selected.reset();
      };

      return Overlay;

    })(Backbone.View);
    OverlayItem = (function(_super) {
      __extends(OverlayItem, _super);

      function OverlayItem() {
        _ref4 = OverlayItem.__super__.constructor.apply(this, arguments);
        return _ref4;
      }

      OverlayItem.prototype.template = "<%= typeof e !== 'undefined' && e ? e : '&nbsp;' %><span class='elevation'><%= elv %></span>";

      OverlayItem.prototype.tagName = 'li';

      OverlayItem.prototype.initialize = function() {
        return this.listenTo(this.model, {
          "change": this.render,
          "modification": this.modifyTileInfo
        });
      };

      OverlayItem.prototype.modifyTileInfo = function() {
        var modal, multi, self, str, tile;
        ut.c("modiying tile info");
        if (_selected.length > 1) {
          multi = true;
        } else {
          multi = false;
        }
        tile = this.model;
        if (multi) {
          str = "<h3>Editing Many</h3>";
        } else {
          str = "";
        }
        modal = ut.launchModal(str + _.template(_enterInfo, _.extend(tile.toJSON(), {
          x: tile.x,
          y: tile.y
        })));
        modal.find(".js-add-elevation").select();
        self = this;
        modal.on("keydown", ".js-add-dirs, .js-add-elevation", function(e) {
          var key;
          key = e.keyCode || e.which;
          if (key !== 9) {
            $(this).attr("changed", true);
          }
          if (key === 13) {
            if (multi) {
              return self.parent.modifyAllTiles(modal);
            } else {
              self.applyChanges(modal);
              return _selected.remove(self.model.cid);
            }
          }
        });
        return tile;
      };

      OverlayItem.prototype.applyChanges = function(modal, proceed) {
        var next;
        if (modal.find(".js-add-dirs").inputChanged()) {
          this.model.set("e", modal.find(".js-add-dirs").val());
        }
        if (modal.find(".js-add-elevation").inputChanged()) {
          this.model.set("elv", parseInt(modal.find(".js-add-elevation").val()));
        }
        ut.destroyModal();
        this.model.trigger("expose");
        this.unselect();
        if (proceed !== false) {
          next = getNextTile(this.model.x, this.model.y);
          if (next.tile) {
            return next.tile.modifier.modifyTileInfo(modal, proceed);
          }
        }
      };

      OverlayItem.prototype.render = function() {
        this.$el.html(_.template(this.template, this.model.toJSON()));
        return this;
      };

      OverlayItem.prototype.select = function() {
        this.$el.addClass("selected-tile");
        this.selected = true;
        return _selected.add(this.model);
      };

      OverlayItem.prototype.unselect = function() {
        this.$el.removeClass("selected-tile");
        return this.selected = false;
      };

      OverlayItem.prototype.events = {
        select: "select",
        unselect: "unselect",
        click: function(e) {
          e.preventDefault();
          if (!e.shiftKey) {
            this.select();
            return this.modifyTileInfo();
          } else {
            if (this.selected === true) {
              return this.unselect();
            } else {
              return this.select();
            }
          }
        }
      };

      return OverlayItem;

    })(Backbone.View);
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
    toggleOverlay = function() {
      if (!_overlay) {
        return _overlay = new Overlay({
          model: _chunk
        });
      } else {
        _overlay.$el.empty();
        return _overlay = null;
      }
    };
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
      return m.find("textarea").select();
    };
    return {
      toggleOverlay: toggleOverlay,
      getDefaultChunk: function() {
        return JSON.parse(new Chunk()["export"]());
      },
      bindCreators: function(tile) {},
      loadChunk: function(precursor_chunk) {
        var allRows, chunk;
        chunk = new Chunk;
        allRows = [];
        _.each(precursor_chunk, function(row, i) {
          var rowCollection;
          rowCollection = new Row;
          _.each(row, function(tile, j) {
            var TileModel;
            tile = _.pick(tile, "t", "e", "elv");
            rowCollection.add(TileModel = new Tile(tile));
            TileModel.x = j;
            TileModel.y = i;
            return TileModel.set({
              x: j,
              y: i
            });
          });
          return allRows[i] = rowCollection;
        });
        chunk.set("rows", allRows);
        _chunk = chunk;
        toggleOverlay();
        toggleOverlay();
        return _chunk = chunk;
      },
      exportMap: exportMap
    };
  });

}).call(this);
