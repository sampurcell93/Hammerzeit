(function() {
  define(["globals", "utilities", "underscore", "easel", "jquery"], function(globals, ut) {
    var chunkify, getFromShorthand, loadMap, renderMap, setDefaultTileAttrs, tileheight, tiles, tileurl, tilewidth;
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
    chunkify = function(matrix) {
      return matrix;
    };
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
    loadMap = function(map, exceptions) {
      var bitmaparray;
      bitmaparray = [];
      _.each(map, function(tile, i, j) {
        var type;
        ut.c(tile);
        if ($.isArray(tile)) {
          return bitmaparray.push(loadMap(_.flatten(tile)));
        } else {
          if (typeof tile === "object") {
            type = tile.type;
          } else {
            type = tile;
          }
          return bitmaparray.push(new createjs.Bitmap(getFromShorthand(type, tiles)));
        }
      });
      ut.c(bitmaparray);
      return bitmaparray;
    };
    renderMap = function(bitmap, stage, vertindex) {
      vertindex || (vertindex = 0);
      _.each(bitmap, function(tile, i) {
        if ($.isArray(tile)) {
          return renderMap(tile, stage, i);
        } else {
          tile.x = tilewidth * i;
          tile.y = tileheight * vertindex;
          return stage.addChild(tile);
        }
      });
      return stage.terrain = bitmap;
    };
    return {
      loadMap: function(mapChunks, exceptions) {
        var fullmap;
        fullmap = [];
        _.each(mapChunks, function(chunk) {
          return fullmap.unshift(loadMap(chunk, exceptions));
        });
        return fullmap;
      },
      renderMap: function(bitmap, stage) {
        return renderMap(bitmap, stage);
      }
    };
  });

}).call(this);
