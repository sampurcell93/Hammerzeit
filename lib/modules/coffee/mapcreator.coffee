define ["globals", "utilities", "backbone", "jquery", "underscore"], (globals, ut) ->

    t = ut.tileEntryCheckers
    _enterInfo = $("#modify-tile").html()

    # Instantiate empty chunk of enterable spaces
    window._chunk = []
    for i in [0...globals.map.tileheight]
        _chunk[i] = []
        for j in [0...globals.map.tilewidth] then _chunk[i][j] = {t: 'e'}

    getArrayPos = (x,y) ->
        x /= 50
        y /= 50
        return {
            x: x
            y: y
        }

    # Takes in a json array containing string representations of functions 
    # and converts them to direct references to the function (a member of ut.tileEntryCheckers)

    # Give a tile coord set and this finds the next tile, ltr preferential
    getNextTile = (x,y) ->
        if x < 19
            x++
            return {tile: _chunk[y][x], y: y, x: x}
        else if x is 19 and y < 13 
            y++
            return {tile: _chunk[y][0], y: y, x: 0}
        else null

    # Handles the view and array modification 
    modifyTileInfo = (tile, x, y) ->
        console.log "modifying tile x,y:" + x + "," + y
        if !tile? then return null
        modal = ut.launchModal("x: " + x + "<br />y: " + y + _.template(_enterInfo, tile))
        dirinput = modal.find(".js-add-dirs").select()
        applyDirs = ->
            v = dirinput.val()
            if !v then tile.e = true
            tile.e = v
            ut.destroyModal()
            next = getNextTile(x,y)
            modifyTileInfo(next.tile, next.x, next.y)

        modal.on("keydown", ".js-add-dirs", (e) ->
            key = e.keyCode || e.which
            if key == 13 then applyDirs()

        )
        modal.on("click", ".js-submit-dirs", applyDirs)
        tile

    Overlay = Backbone.View.extend
        el: '.enterable-list'
        initialize: (@tiles) ->
            _.bindAll @, "render"
            @render()
        render: ->
            @$el.empty()
            _.each @tiles, (row) =>
                _.each row, (tiles) =>
                    _.each tiles, (tile) =>
                        item = new OverlayItem tile: tile
                        @$el.append(item.render().el)


    OverlayItem = Backbone.View.extend
        tagName: 'li'
        initialize: (@tile) ->
        render: ->
            @$el.html(@tile.tile.e || " e ")
            @


    exportMap = ->
        ut.c "before stringify"
        ut.c _chunk[0][14]
        ut.launchModal(JSON.stringify(_chunk))
        new Overlay tiles: _chunk

    return {
        getDefaultChunk: ->
            _chunk
        bindCreators: (tile) ->
            tile.addEventListener "click", ->
                ut.c tile
                coords = getArrayPos tile.x, tile.y
                modifyTileInfo _chunk[coords.y][coords.x], coords.x, coords.y
            tile.addEventListener "pressmove", ->
                exportMap()
        loadChunk: (precursor_chunk) ->
            ut.c "HERE LOADING CHUNK"
            ut.c precursor_chunk
            # Deep copy
            _.each precursor_chunk, (row, i) ->
                _.each row, (col, j) ->
                    if typeof col is "object"
                        _chunk[i][j] = $.extend(true, {}, col)
                        if col.hasOwnProperty("dirs")
                            _chunk[i][j].e = t[col.dirs]
                    else _chunk[i][j] = col
            _chunk
        exportMap: ->
            exportMap()
        # Expects the tile and the tile's x y array coordinates
        modifyTileInfo: (tile, x, y) ->
            modifyTileInfo tile

    }