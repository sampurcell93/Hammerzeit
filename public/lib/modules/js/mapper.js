(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "board", "mapper", "underscore", "backbone", "easel", "jquery"], function(globals, ut, board, mapper) {
    var Chunk, Row, Tile, clearChunk, createBitEventRegister, getFromShorthand, loadChunk, modifyBackground, renderChunk, setDefaultTileAttrs, setTile, stage, tileheight, tiles, tileurl, tilewidth, _3dtiles, _activechunk, _activeprecursor, _backbone, _ref, _ref1, _ref2;
    tileurl = 'images/tiles/<%=name%>.<%=typeof filetype !== "undefined" ? filetype : "jpg" %>';
    tilewidth = tileheight = 50;
    tiles = null;
    _activechunk = null;
    _activeprecursor = null;
    _backbone = null;
    stage = board.getStage();
    _3dtiles = null;
    Tile = (function(_super) {
      __extends(Tile, _super);

      function Tile() {
        _ref = Tile.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Tile.prototype.defaults = {
        t: 'e',
        e: '',
        elv: 0,
        end: true,
        m: 1
      };

      Tile.prototype.initialize = function(attrs) {
        return this.on("expose", this.expose);
      };

      Tile.prototype.expose = function() {
        return setTile(this.attributes);
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

      Chunk.prototype.getFromCoords = function(x, y) {
        x /= 50;
        y /= 50;
        return this.get("rows")[y].at(x);
      };

      return Chunk;

    })(Backbone.Model);
    $.getJSON("lib/json_packs/tiles.json", {}, function(t) {
      tiles = t;
      return _.each(tiles, setDefaultTileAttrs);
    });
    setDefaultTileAttrs = function(tile, key) {
      tile.url = _.template(tileurl, tile);
      tile.loaded = false;
      if (_.has(tile, "subtypes")) {
        return _.each(tile["subtypes"], setDefaultTileAttrs);
      }
    };
    getFromShorthand = function(chars, nestedobj) {
      var parent;
      if (_.has(nestedobj, chars)) {
        return nestedobj[chars];
      }
      parent = chars.charAt(0);
      console.log(chars, nestedobj);
      if (_.has(nestedobj[parent], "subtypes")) {
        return getFromShorthand(chars.slice(1), nestedobj[parent].subtypes);
      } else {
        return nestedobj[parent];
      }
    };
    createBitEventRegister = function(bitmap, x, y) {
      var hit;
      hit = new createjs.Shape();
      hit.graphics.beginFill("#000").drawRect(0, 0, 50, 50);
      return hit;
    };
    ({
      loadChunkFromURL: function(url) {}
    });
    setTile = function(tile) {
      return _.extend(_activechunk.children[tile.y].children[tile.x], _.omit(tile, "x", "y"));
    };
    loadChunk = function(map) {
      var bitmaparray;
      bitmaparray = [];
      _.each(map, function(tile) {
        var extend, h, i, temp, type, w, _i, _ref3;
        if ($.isArray(tile)) {
          if (tile.length === 1) {
            extend = [];
            for (i = _i = 0, _ref3 = globals.map.width / tilewidth; 0 <= _ref3 ? _i < _ref3 : _i > _ref3; i = 0 <= _ref3 ? ++_i : --_i) {
              extend.push(tile[0]);
            }
          }
          return bitmaparray.push(loadChunk(_.flatten(extend || tile)));
        } else {
          if (typeof tile === "object") {
            type = tile.t;
          } else {
            type = tile;
          }
          temp = getFromShorthand(type, tiles);
          w = tile.width || 1;
          h = tile.height || 1;
          return bitmaparray.push(_.extend(new createjs.Bitmap(temp.url), temp || {}, tile || {}));
        }
      });
      return bitmaparray;
    };
    clearChunk = function() {
      stage.removeChild(_activechunk);
      return stage.removeChild(_3dtiles);
    };
    renderChunk = function(bitmap, vertindex) {
      var container;
      vertindex || (vertindex = 0);
      container = new createjs.Container();
      container.x = 0;
      container.y = 0;
      _.each(bitmap, function(tile, i) {
        if ($.isArray(tile)) {
          return container.addChild(renderChunk(tile, i));
        } else {
          tile.x = tilewidth * i;
          tile.y = tileheight * vertindex;
          tile.hitArea = createBitEventRegister(tile, tile.x, tile.y);
          if (tile.t !== "e" && tile.t !== "p") {
            return _3dtiles.addChild(tile);
          } else {
            return container.addChild(tile);
          }
        }
      });
      stage.terrain = bitmap;
      stage.addChild(container);
      return container;
    };
    modifyBackground = function(bitmap) {
      board.setBackground(bitmap.background || "");
      return board.setBackgroundPosition(bitmap.background_position || "top left");
    };
    return window.mapper = {
      loadChunk: function(chunk) {
        if (typeof chunk === "string") {
          return loadChunkFromURL(chunk);
        } else {
          _activeprecursor = loadChunk(chunk.tiles);
          return _.extend(_activeprecursor, _.omit(chunk, "tiles"));
        }
      },
      renderChunk: function(bitmap) {
        var container;
        clearChunk();
        _3dtiles = new createjs.Container();
        _3dtiles.name = "3dtiles";
        container = renderChunk(bitmap);
        modifyBackground(bitmap);
        stage.addChild(_3dtiles);
        return _activechunk = container;
      },
      clearChunk: function() {
        return clearChunk();
      },
      getVisibleChunk: function() {
        return _activechunk;
      },
      setTile: function(tile) {
        return setTile(tile);
      },
      Tile: Tile,
      Row: Row,
      Chunk: Chunk
    };
  });

}).call(this);
