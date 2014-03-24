(function() {
  define(["globals", "utilities", "underscore", "easel", "jquery"], function(globals, ut) {
    var clearChunk, getFromShorthand, loadChunk, renderChunk, setDefaultTileAttrs, tileheight, tiles, tileurl, tilewidth, _activechunk;
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
    loadChunk = function(map) {
      var bitmaparray;
      bitmaparray = [];
      ut.c(map);
      _.each(map, function(tile) {
        var h, temp, type, w;
        if ($.isArray(tile)) {
          return bitmaparray.push(loadChunk(_.flatten(tile)));
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
      _.each(bitmap, function(tile, i) {
        if ($.isArray(tile)) {
          return container.addChild(renderChunk(tile, stage, i));
        } else {
          if (tile.width != null) {

          }
          tile.x = tilewidth * i;
          tile.y = tileheight * vertindex;
          return container.addChild(tile);
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
        clearChunk(stage);
        ut.c(stage);
        return renderChunk(bitmap, stage);
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
