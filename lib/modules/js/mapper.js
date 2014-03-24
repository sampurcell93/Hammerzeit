(function() {
  define(["globals", "utilities", "underscore", "easel", "jquery"], function(globals, ut) {
    var clearChunk, getFromShorthand, loadChunk, renderChunk, setDefaultTileAttrs, tileheight, tiles, tileurl, tilewidth;
    tileurl = 'images/tiles/<%=name%>.jpg';
    tiles = {
      t: {
        name: 'trees',
        enter: true,
        subtypes: {
          en: {
            name: "treeedgenorth",
            enter: true
          }
        }
      },
      g: {
        enter: true,
        name: 'grass',
        subtypes: {
          wbr: {
            enter: false,
            name: "grasswaterbottomright"
          },
          wtr: {
            enter: true,
            name: "grasswatertopright"
          },
          wtl: {
            enter: true,
            name: "grasswatertopleft"
          },
          wbl: {
            enter: false,
            name: "grasswaterbottomleft"
          }
        }
      },
      m: {
        enter: false,
        name: 'mountain'
      },
      w: {
        enter: false,
        name: 'water',
        subtypes: {
          v: {
            enter: false,
            name: 'watervertical'
          },
          h: {
            enter: false,
            name: 'waterhorizontal'
          }
        }
      },
      f: {
        enter: true,
        name: 'forest'
      },
      s: {
        enter: true,
        name: 'sand'
      }
    };
    tilewidth = tileheight = 50;
    setDefaultTileAttrs = function(tile, key) {
      tile.url = _.template(tileurl, {
        name: tile.name
      });
      tile.loaded = false;
      if (tile.hasOwnProperty("subtypes")) {
        return _.each(tile["subtypes"], setDefaultTileAttrs);
      }
    };
    _.each(tiles, setDefaultTileAttrs);
    getFromShorthand = function(chars, nestedobj) {
      var parent;
      if (nestedobj.hasOwnProperty(chars)) {
        return nestedobj[chars].url;
      }
      parent = chars.charAt(0);
      if (nestedobj[parent].hasOwnProperty("subtypes")) {
        return getFromShorthand(chars.slice(1), nestedobj[parent].subtypes);
      } else {
        return nestedobj[parent].url;
      }
    };
    loadChunk = function(map) {
      var bitmaparray;
      bitmaparray = [];
      ut.c(map);
      _.each(map, function(tile, i, j) {
        var type;
        if ($.isArray(tile)) {
          return bitmaparray.push(loadChunk(_.flatten(tile)));
        } else {
          if (typeof tile === "object") {
            type = tile.type;
          } else {
            type = tile;
          }
          return bitmaparray.push(new createjs.Bitmap(getFromShorthand(type, tiles)));
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
          tile.x = tilewidth * i;
          tile.y = tileheight * vertindex;
          return container.addChild(tile);
        }
      });
      stage.terrain = bitmap;
      stage.addChild(container);
      return container;
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
      }
    };
  });

}).call(this);
