(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "board", "mapper", "underscore", "backbone", "easel", "jquery"], function(globals, ut, board, mapper) {
    var Chunk, Row, Tile, bindModel, clearChunk, createBitEventRegister, getFromShorthand, i, loadChunk, modifyBackground, renderChunk, setDefaultTileAttrs, setTile, stage, tileheight, tiles, tileurl, tilewidth, _3dtiles, _activebitmap, _activechunk, _backbone, _cached_chunks, _checkEntry, _i, _ref, _ref1, _ref2;
    tileurl = 'images/tiles/<%=name%>.<%=typeof filetype !== "undefined" ? filetype : "jpg" %>';
    tilewidth = tileheight = 50;
    tiles = null;
    _activechunk = null;
    _activebitmap = null;
    _backbone = null;
    stage = board.getStage();
    _3dtiles = null;
    _checkEntry = ut.tileEntryCheckers;
    _cached_chunks = [];
    for (i = _i = 0; _i <= 3; i = ++_i) {
      _cached_chunks[i] = [];
    }
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

      Tile.prototype.initialize = function() {
        var _this = this;
        this.pathFromStart = {
          start: {
            x: 0,
            y: 0
          },
          path: []
        };
        return this.on("change:occupied_by", function(model, value) {});
      };

      Tile.prototype.expose = function() {
        setTile(this.attributes);
        return this;
      };

      Tile.prototype.removePotentialMovePath = function() {
        this.pathFromStart.path = [];
        this.trigger("removemove");
        return this;
      };

      Tile.prototype.isOccupied = function() {
        return this.get("occupied") === true;
      };

      Tile.prototype.getOccupant = function() {
        return this.get("occupied_by");
      };

      Tile.prototype.occupy = function(obj) {
        this.set("occupied", true);
        this.set("occupied_by", obj);
        return this;
      };

      Tile.prototype.checkEnterable = function(dx, dy, start, opts) {
        var e;
        if (opts == null) {
          opts = {};
        }
        e = this.get("e");
        if (e === false || e === "f" && !opts.ignoreDeltas) {
          return false;
        } else if (this.isOccupied() && !opts.ignoreNPCs) {
          return false;
        } else if (e === "") {
          return true;
        } else if (_.isString(e) && !opts.ignoreDeltas) {
          return _checkEntry[e](dx, dy);
        } else {
          return true;
        }
      };

      Tile.prototype.leave = function() {
        this.set("occupied", false);
        this.set("occupied_by", null);
        return this;
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

      Row.prototype.getOccupied = function(opts) {
        var _this = this;
        if (opts == null) {
          opts = {
            reject: function() {
              return false;
            }
          };
        }
        return new Row(_.filter(this.models, function(model) {
          return model.isOccupied() && !opts.reject(model);
        }));
      };

      return Row;

    })(Backbone.Collection);
    Chunk = (function(_super) {
      __extends(Chunk, _super);

      function Chunk() {
        _ref2 = Chunk.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      Chunk.prototype.defaults = function() {
        var j, row, rows, tile, _j, _k, _ref3, _ref4;
        rows = [];
        for (i = _j = 0, _ref3 = globals.map.tileheight; 0 <= _ref3 ? _j < _ref3 : _j > _ref3; i = 0 <= _ref3 ? ++_j : --_j) {
          rows[i] = row = new Row;
          row.chunk = this;
          for (j = _k = 0, _ref4 = globals.map.tilewidth; 0 <= _ref4 ? _k < _ref4 : _k > _ref4; j = 0 <= _ref4 ? ++_k : --_k) {
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
      if (_.has(nestedobj[parent], "subtypes")) {
        return getFromShorthand(chars.slice(1), nestedobj[parent].subtypes);
      } else {
        return nestedobj[parent];
      }
    };
    createBitEventRegister = function(bitmap, x, y) {
      return new createjs.Shape(new createjs.Graphics().beginFill("#f00").drawRect(0, 0, 50, 50));
    };
    ({
      loadChunkFromURL: function(url) {}
    });
    setTile = function(tile) {
      return _.extend(_activechunk.children[tile.y].children[tile.x], _.omit(tile, "x", "y"));
    };
    bindModel = function(bitmap) {
      var model;
      model = bitmap.tileModel = new Tile(_.pick(bitmap, "x", "y", "e", "t", "end", "elv", "m"));
      model.bitmap = bitmap;
      return bitmap;
    };
    loadChunk = function(map) {
      var bitmaparray;
      bitmaparray = [];
      _.each(map, function(tile) {
        var bitmap, extend, h, temp, type, w, _j, _ref3;
        if ($.isArray(tile)) {
          if (tile.length === 1) {
            extend = [];
            for (i = _j = 0, _ref3 = globals.map.width / tilewidth; 0 <= _ref3 ? _j < _ref3 : _j > _ref3; i = 0 <= _ref3 ? ++_j : --_j) {
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
          bitmap = new createjs.Bitmap(temp.url);
          bitmap = _.extend(bitmap, temp || {}, tile || {});
          return bitmaparray.push(bindModel(bitmap));
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
            _3dtiles.addChild(tile);
          }
          return container.addChild(tile);
        }
      });
      stage.terrain = bitmap;
      stage.addChild(container);
      return container;
    };
    modifyBackground = function(bitmap) {
      board.setBackgroundPosition(bitmap.background_position || "top left");
      return board.setBackground(bitmap.background || false);
    };
    return window.mapper = {
      loadChunk: function(chunk, x, y) {
        if (_cached_chunks[y][x]) {
          return _cached_chunks[y][x];
        } else {
          _activebitmap = loadChunk(chunk.tiles);
          return _activebitmap = _cached_chunks[y][x] = _.extend(_activebitmap, _.omit(chunk, "tiles"));
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
      getTargetTile: function(dx, dy, start) {
        var x, y, _ref3;
        if (_activechunk) {
          y = (start.y + (50 * dy)) / 50;
          x = (start.x + (50 * dx)) / 50;
          return ((_ref3 = _activechunk.children[y]) != null ? _ref3.children[x] : void 0) || {};
        }
      },
      Tile: Tile,
      Row: Row,
      Chunk: Chunk
    };
  });

}).call(this);
