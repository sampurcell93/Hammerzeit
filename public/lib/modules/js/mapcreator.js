(function() {
  define(["globals", "utilities", "mapper", "backbone", "jquery", "jquery-ui", "underscore"], function(globals, ut, mapper) {
    var Chunk, Overlay, Row, Tile, exportMap, i, t, toggleOverlay, _cached_chunks, _chunk, _i, _overlay, _selected;
    t = ut.tileEntryCheckers;
    _overlay = null;
    _cached_chunks = [];
    for (i = _i = 0; _i <= 3; i = ++_i) {
      _cached_chunks[i] = [];
    }
    Tile = mapper.Tile;
    Row = mapper.Row;
    Chunk = mapper.Chunk;
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
    _chunk = null;
    Overlay = mapper.Overlay;
    toggleOverlay = function() {
      if (!_overlay) {
        _overlay = new Overlay({
          model: _chunk
        });
        _overlay.render();
        return _overlay.showing = true;
      } else {
        _overlay.showing = false;
        _overlay.$el.empty();
        return _overlay = null;
      }
    };
    exportMap = function() {
      var m;
      m = ut.launchModal("<textarea>" + _chunk["export"]() + "</textarea>");
      return m.find("textarea").select();
    };
    return {
      render: function() {
        if (_overlay && _overlay.showing) {
          _overlay.model = _chunk;
          return _overlay.render();
        }
      },
      toggleOverlay: function() {
        return toggleOverlay();
      },
      loadChunk: function(precursor_chunk, x, y) {
        if (_cached_chunks[y][x]) {
          return _chunk = _cached_chunks[y][x];
        }
        return _cached_chunks[y][x] = _chunk = mapper.chunkifyBitmap(precursor_chunk);
      },
      getChunk: function() {
        return _chunk;
      },
      exportMap: function() {
        return exportMap();
      },
      Overlay: Overlay
    };
  });

}).call(this);
