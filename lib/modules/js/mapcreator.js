(function() {
  define(["globals", "utilities", "backbone", "jquery", "underscore"], function(globals, ut) {
    var Overlay, OverlayItem, exportMap, getArrayPos, getNextTile, i, j, modifyTileInfo, t, _enterInfo, _i, _j, _ref, _ref1;
    t = ut.tileEntryCheckers;
    _enterInfo = $("#modify-tile").html();
    window._chunk = [];
    for (i = _i = 0, _ref = globals.map.tileheight; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      _chunk[i] = [];
      for (j = _j = 0, _ref1 = globals.map.tilewidth; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        _chunk[i][j] = {
          t: 'e'
        };
      }
    }
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
          tile: _chunk[y][x],
          y: y,
          x: x
        };
      } else if (x === 19 && y < 13) {
        y++;
        return {
          tile: _chunk[y][0],
          y: y,
          x: 0
        };
      } else {
        return null;
      }
    };
    modifyTileInfo = function(tile, x, y) {
      var applyDirs, dirinput, modal;
      console.log("modifying tile x,y:" + x + "," + y);
      if (tile == null) {
        return null;
      }
      modal = ut.launchModal("x: " + x + "<br />y: " + y + _.template(_enterInfo, tile));
      dirinput = modal.find(".js-add-dirs").select();
      applyDirs = function() {
        var next, v;
        v = dirinput.val();
        if (!v) {
          tile.e = true;
        }
        tile.e = v;
        ut.destroyModal();
        next = getNextTile(x, y);
        return modifyTileInfo(next.tile, next.x, next.y);
      };
      modal.on("keydown", ".js-add-dirs", function(e) {
        var key;
        key = e.keyCode || e.which;
        if (key === 13) {
          return applyDirs();
        }
      });
      modal.on("click", ".js-submit-dirs", applyDirs);
      return tile;
    };
    Overlay = Backbone.View.extend({
      el: '.enterable-list',
      initialize: function(tiles) {
        this.tiles = tiles;
        _.bindAll(this, "render");
        return this.render();
      },
      render: function() {
        var _this = this;
        this.$el.empty();
        return _.each(this.tiles, function(row) {
          return _.each(row, function(tiles) {
            return _.each(tiles, function(tile) {
              var item;
              item = new OverlayItem({
                tile: tile
              });
              return _this.$el.append(item.render().el);
            });
          });
        });
      }
    });
    OverlayItem = Backbone.View.extend({
      tagName: 'li',
      initialize: function(tile) {
        this.tile = tile;
      },
      render: function() {
        this.$el.html(this.tile.tile.e || " e ");
        return this;
      }
    });
    exportMap = function() {
      ut.c("before stringify");
      ut.c(_chunk[0][14]);
      ut.launchModal(JSON.stringify(_chunk));
      return new Overlay({
        tiles: _chunk
      });
    };
    return {
      getDefaultChunk: function() {
        return _chunk;
      },
      bindCreators: function(tile) {
        tile.addEventListener("click", function() {
          var coords;
          ut.c(tile);
          coords = getArrayPos(tile.x, tile.y);
          return modifyTileInfo(_chunk[coords.y][coords.x], coords.x, coords.y);
        });
        return tile.addEventListener("pressmove", function() {
          return exportMap();
        });
      },
      loadChunk: function(precursor_chunk) {
        ut.c("HERE LOADING CHUNK");
        ut.c(precursor_chunk);
        _.each(precursor_chunk, function(row, i) {
          return _.each(row, function(col, j) {
            if (typeof col === "object") {
              _chunk[i][j] = $.extend(true, {}, col);
              if (col.hasOwnProperty("dirs")) {
                return _chunk[i][j].e = t[col.dirs];
              }
            } else {
              return _chunk[i][j] = col;
            }
          });
        });
        return _chunk;
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
