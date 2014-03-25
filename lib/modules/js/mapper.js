(function() {
  define(["globals", "utilities", "underscore", "easel", "jquery"], function(globals, ut) {
    var clearChunk, createBitEventRegister, getFromShorthand, loadChunk, renderChunk, setDefaultTileAttrs, tileheight, tiles, tileurl, tilewidth, _activechunk;
    tileurl = 'images/tiles/<%=name%>.<%=typeof filetype !== "undefined" ? filetype : "jpg" %>';
    tilewidth = tileheight = 50;
    tiles = null;
    _activechunk = null;
    $.getJSON("lib/json_packs/tiles.json", {}, function(t) {
      tiles = t;
      return _.each(tiles, setDefaultTileAttrs);
    });
    setDefaultTileAttrs = function(tile, key) {
      tile.url = _.template(tileurl, tile);
      tile.loaded = false;
      if (tile.hasOwnProperty("subtypes")) {
        return _.each(tile["subtypes"], setDefaultTileAttrs);
      }
    };
    getFromShorthand = function(chars, nestedobj) {
      var parent;
      if (nestedobj.hasOwnProperty(chars)) {
        return nestedobj[chars];
      }
      parent = chars.charAt(0);
      if (nestedobj[parent].hasOwnProperty("subtypes")) {
        return getFromShorthand(chars.slice(1), nestedobj[parent].subtypes);
      } else {
        return nestedobj[parent];
      }
    };
    createBitEventRegister = function(bitmap, x, y) {
      var hit;
      hit = new createjs.Shape();
      hit.graphics.beginFill("#000").drawRect(0, 0, 50, 50);
      ut.c("adding a hit register:");
      console.log(hit);
      return hit;
    };
    loadChunk = function(map) {
      var bitmaparray;
      bitmaparray = [];
      _.each(map, function(tile) {
        var extend, h, i, temp, type, w, _i, _ref;
        if ($.isArray(tile)) {
          if (tile.length === 1) {
            extend = [];
            for (i = _i = 0, _ref = globals.map.width / tilewidth; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
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
    clearChunk = function(stage) {
      return stage.removeChildAt(0);
    };
    renderChunk = function(bitmap, stage, vertindex) {
      var container;
      vertindex || (vertindex = 0);
      container = new createjs.Container();
      container.x = 0;
      container.y = 0;
      _.each(bitmap, function(tile, i) {
        if ($.isArray(tile)) {
          return container = renderChunk(tile, stage, i);
        } else {
          tile.x = tilewidth * i;
          tile.y = tileheight * vertindex;
          tile.hitArea = createBitEventRegister(tile, tile.x, tile.y);
          container.addChild(tile);
          return tile.addEventListener("click", function() {
            ut.c("CLICKED TILE");
            return ut.c(tile);
          });
        }
      });
      stage.terrain = bitmap;
      stage.addChild(container);
      return _activechunk = container;
    };
    return {
      loadChunk: function(chunk) {
        return loadChunk(chunk);
      },
      renderChunk: function(bitmap, stage) {
        var test;
        clearChunk(stage);
        renderChunk(bitmap, stage);
        test = new createjs.Bitmap("images/tiles/grass.jpg");
        test.x = 100;
        test.y = 100;
        stage.addChild(test);
        return test.addEventListener("click", function() {
          ut.c("yolo");
          return ut.c(stage.getObjectsUnderPoint(100, 100));
        });
      },
      clearChunk: function(stage) {
        return clearChunk(stage);
      },
      getVisibleChunk: function(stage) {
        return _activechunk;
      }
    };
  });

}).call(this);
