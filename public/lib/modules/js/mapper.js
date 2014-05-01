(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "board"], function(globals, ut, board) {
    var Chunk, Overlay, OverlayItem, Row, Tile, bindModel, clearChunk, createBitEventRegister, getFromShorthand, i, modifyBackground, renderChunk, setDefaultTileAttrs, setTile, stage, tileheight, tiles, tileurl, tilewidth, _activebitmap, _activechunk, _backbone, _cached_chunks, _checkEntry, _i, _ref, _ref1, _ref2, _ref3;
    tileurl = 'images/tiles/<%=name%>.<%=typeof filetype !== "undefined" ? filetype : "jpg" %>';
    tilewidth = tileheight = 50;
    tiles = null;
    _activechunk = null;
    _activebitmap = null;
    _backbone = null;
    stage = board.getStage();
    _checkEntry = ut.tileEntryCheckers;
    _cached_chunks = [];
    for (i = _i = 0; _i <= 3; i = ++_i) {
      _cached_chunks[i] = [];
    }
    Overlay = (function(_super) {
      __extends(Overlay, _super);

      function Overlay() {
        _ref = Overlay.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Overlay.prototype.el = '.enterable-list';

      Overlay.prototype.initialize = function(opts) {
        this.child = opts.child;
        return _.bindAll(this, "render");
      };

      Overlay.prototype.render = function() {
        var _this = this;
        if (!this.model) {
          return this;
        }
        this.$el.empty();
        return _.each(this.model.get("rows"), function(row) {
          return _.each(row.models, function(tile) {
            var item;
            item = _this.child || OverlayItem;
            item = new item({
              model: tile
            });
            item.parent = _this;
            if (item instanceof OverlayItem) {
              tile.modifier = item;
            }
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
        _ref1 = OverlayItem.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      OverlayItem.prototype.template = $("#mapcreate-item").html();

      OverlayItem.prototype.tagName = 'li';

      OverlayItem.prototype.initialize = function() {
        var enterInfo;
        this.listenTo(this.model, {
          "change": this.render,
          "modification": this.modifyTileInfo
        });
        enterInfo = $("#modify-tile").html();
        return this.modifyTileInfo = function() {
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
          modal = ut.launchModal(str + _.template(enterInfo, _.extend(tile.toJSON(), {
            x: tile.x,
            y: tile.y
          })));
          modal.find(".js-add-elevation").select();
          self = this;
          modal.on("keydown", ".js-change", function(e) {
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
      };

      OverlayItem.prototype.applyChanges = function(modal, proceed) {
        var getNextTile, next, self,
          _this = this;
        getNextTile = function(x, y) {
          if (x < 19) {
            x++;
            return {
              tile: _this.parent.model.get("rows")[y].at(x),
              y: y,
              x: x
            };
          } else if (x === 19 && y < 13) {
            y++;
            return {
              tile: _this.parent.model.get("rows")[y].at(0),
              y: y,
              x: 0
            };
          } else {
            return null;
          }
        };
        self = this;
        if (modal.find(".js-diff").inputChanged()) {
          this.model.set("m", parseInt(modal.find(".js-diff").val()));
        }
        if (modal.find(".js-can-end").inputChanged()) {
          this.model.set("end", ut.parseBool(modal.find(".js-can-end").val()));
        }
        if (modal.find(".js-add-type").inputChanged()) {
          this.model.set("t", modal.find(".js-add-type").val());
        }
        if (modal.find(".js-add-dirs").inputChanged()) {
          this.model.set("e", modal.find(".js-add-dirs").val());
        }
        if (modal.find(".js-add-elevation").inputChanged()) {
          this.model.set("elv", parseInt(modal.find(".js-add-elevation").val()));
        }
        ut.destroyModal();
        this.model.expose();
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
    Tile = (function(_super) {
      __extends(Tile, _super);

      function Tile() {
        _ref2 = Tile.__super__.constructor.apply(this, arguments);
        return _ref2;
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

      Tile.prototype.tooHigh = function(start, jump) {
        return !(Math.abs(start.elv - this.get("elv")) > jump);
      };

      return Tile;

    })(Backbone.Model);
    Row = (function(_super) {
      __extends(Row, _super);

      function Row() {
        _ref3 = Row.__super__.constructor.apply(this, arguments);
        return _ref3;
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
    clearChunk = function() {
      stage.removeChild(_activechunk);
      return stage.removeChild(_3dtiles);
    };
    Chunk = (function() {
      function Chunk() {
        var j, _j, _k;
        this.container = new createjs.Container();
        for (i = _j = 0; _j <= 18; i = ++_j) {
          this.container.children[i] = new createjs.Container();
          for (j = _k = 0; _k <= 13; j = ++_k) {
            this.container.children[i].children[j] = new Tile();
          }
        }
        this;
      }

      Chunk.prototype["export"] = function() {
        return this.container;
      };

      Chunk.prototype.plain = function() {
        var arr, j, _j, _results;
        arr = [];
        _results = [];
        for (i = _j = 0; _j <= 18; i = ++_j) {
          arr[i] = [];
          _results.push((function() {
            var _k, _results1;
            _results1 = [];
            for (j = _k = 0; _k <= 13; j = ++_k) {
              _results1.push(arr[i][j] = {});
            }
            return _results1;
          })());
        }
        return _results;
      };

      return Chunk;

    })();
    renderChunk = function(bitmap, vertindex) {
      var container, _3dtiles;
      if (vertindex == null) {
        vertindex = 0;
      }
      _3dtiles = new createjs.Container();
      container = new createjs.Container();
      container.x = 0;
      container.y = 0;
      _.each(bitmap, function(tile, i) {
        var h, processed, type, w;
        if (_.isArray(tile)) {
          return container.addChild(renderChunk(tile, i));
        } else {
          if (typeof tile === "object") {
            type = tile.t;
          } else {
            type = tile;
          }
          w = tile.width || 1;
          h = tile.height || 1;
          processed = new createjs.Bitmap("images/tiles/p.png");
          processed.x = tilewidth * i;
          processed.y = tileheight * vertindex;
          processed.hitArea = createBitEventRegister(tile, tile.x, tile.y);
          processed = _.extend(processed, {
            tileModel: new Tile(tile)
          });
          processed.tileModel.bitmap = processed;
          if (tile.t !== "e" && tile.t !== "p") {
            _3dtiles.addChild(processed);
          }
          return container.addChild(processed);
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
      clearChunk: function() {
        return clearChunk();
      },
      setTile: function(tile) {
        return setTile(tile);
      },
      Tile: Tile,
      Row: Row,
      Overlay: Overlay,
      getTargetTile: function(dx, dy, start, chunk) {
        var x, y, _ref4;
        if (dx == null) {
          dx = 0;
        }
        if (dy == null) {
          dy = 0;
        }
        if (chunk == null) {
          chunk = _activechunk;
        }
        if (chunk) {
          y = (start.y + (50 * dy)) / 50;
          x = (start.x + (50 * dx)) / 50;
          return ((_ref4 = chunk.children[y]) != null ? _ref4.children[x] : void 0) || {};
        }
      },
      mapFromPrecursor: function(precursor) {
        modifyBackground(precursor);
        _activechunk = renderChunk(precursor.tiles);
        globals.shared_events.trigger("map:change", _activechunk);
        return _activechunk;
      },
      getVisibleMap: function() {
        return _activechunk;
      },
      getEmptyMap: function() {
        var c;
        c = new Chunk();
        console.log(c["export"]());
        return c["export"]();
      }
    };
  });

}).call(this);
