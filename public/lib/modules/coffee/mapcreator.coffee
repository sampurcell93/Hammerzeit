define ["globals", "utilities", "mapper", "backbone", "jquery", "jquery-ui", "underscore"], (globals, ut, mapper) ->

# export: ->
#             str = "["
#             _.each @get("rows"), (row) ->
#                 str += "["
#                 _.each row.models, (tile) ->
#                     str += JSON.stringify(_.omit(tile.toJSON(),"occupied", "occupied_by")) + ","
#                 str = str.substring(0,str.length-1)
#                 str += "],"
#             str.substring(0,str.length-1) + "]"
    t = ut.tileEntryCheckers
    # Reference to the currently open map overlay
    _overlay = null
    # Prevent reloading of chunks
    _cached_chunks = []
    for i in [0..3]
        _cached_chunks[i] = []

    Tile = mapper.Tile
    Row = mapper.Row
    Chunk = mapper.Chunk

    # Reference to all currently selected tiles
    window._selected = _selected = new Row

    $(".enterable-list").selectable
        selecting: (e, ui) ->
            ut.c "selecting via drag"
            $(ui.selecting).trigger "select"
        unselecting: (e, ui) ->
            ut.c "unselecting via drag"
            $(ui.unselecting).trigger "unselect"
        stop: (e, ui) ->
            ut.c "stop and modify"
            ut.c 
            $(ui.selected).trigger "modification"
        filter: 'li'
        delay: 100

    # Instantiate empty chunk of enterable spaces
    _chunk = null
    Overlay = mapper.Overlay


    toggleOverlay = ->
        if !_overlay
            _overlay = new Overlay model: _chunk
            _overlay.render()
            _overlay.showing = true
        else 
            _overlay.showing = false
            _overlay.$el.empty()
            _overlay = null
    exportMap = ->
        m = ut.launchModal("<textarea>" + _chunk.export() + "</textarea>")
        # ut.c _chunk
        m.find("textarea").select()
    return {
        render: -> if _overlay and _overlay.showing
            _overlay.model = _chunk
            _overlay.render()
        toggleOverlay: -> toggleOverlay()
        # Accepts a bitmaparray and binds a tile model to each bitmap. Easel js needs a DisplayObject format
        # to render properly, but some features require backbone models. this binds a model to each bitmap
        loadChunk: (precursor_chunk, x, y) ->   
            if _cached_chunks[y][x] then return _chunk = _cached_chunks[y][x]
            _cached_chunks[y][x] = _chunk = mapper.chunkifyBitmap precursor_chunk
        getChunk: -> _chunk
        exportMap: -> exportMap()
        Overlay: Overlay
    }   