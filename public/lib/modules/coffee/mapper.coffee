define ["globals", "utilities", "board", "mapper", "underscore", "backbone", "easel", "jquery"], (globals, ut, board, mapper) ->
    tileurl      = 'images/tiles/<%=name%>.<%=typeof filetype !== "undefined" ? filetype : "jpg" %>'
    tilewidth    = tileheight = 50
    tiles        = null
    _activechunk = null
    _activebitmap = null
    _backbone = null
    stage = board.getStage()
    # 3d tiles have to be drawn after the players and npcs, because they overshadow them
    _3dtiles = null
    _checkEntry = ut.tileEntryCheckers

    _cached_chunks = []
    for i in [0..3] then _cached_chunks[i] = []

    class Tile extends Backbone.Model
        defaults: 
            # Type of tile (gets image if there is one)
            t: 'e'
            # Enterable? String points to direction checking functions
            e: ''
            # Elevation - checked against character's jump score
            elv: 0
            # Can a user end their move here?
            end: true
            # Difficulty - how many moves does it take to get through? Do not use "d" as key here
            m: 1
        initialize: ->
            @pathFromStart =
                start: 
                    x: 0
                    y: 0
                path: []
        expose: ->
            setTile @attributes
        removePotentialMovePath: ->
            @pathFromStart.path = []
            @trigger "removemove"
            @
        isOccupied: -> @bitmap.occupied is true
        getOccupant: -> @bitmap.occupiedBy
        occupy: (obj) ->
            @bitmap.occupied = true
            @bitmap.occupiedBy = obj
            @
        # Pass in the target tile and the move deltas, and the NPC will use the current 
        # active chunk to determine if the spot is enterable.
        checkEnterable: (dx, dy, start, opts = {}) ->
            e = @get "e"
            if e is false or e is "f" and !opts.ignoreDeltas then return false
            else if @isOccupied() and !opts.ignoreNPCs then return false
            else if e is "" then return true
            # else if opts.character and !opts.character.isPC() and @get("npc") is false
                # return false
            else if _.isString(e) and !opts.ignoreDeltas
                return _checkEntry[e](dx, dy)
            else true

    class Row extends Backbone.Collection
        model: Tile

    class Chunk extends Backbone.Model
        defaults: ->
            rows = []
            for i in [0...globals.map.tileheight]
                rows[i] = row = new Row
                row.chunk = @
                for j in [0...globals.map.tilewidth] 
                    row.add tile = new Tile({t: 'e'})
                    tile.x = j
                    tile.y = i
            return rows: rows
        export: ->
            str = "["
            _.each @get("rows"), (row) ->
                str += "["
                _.each row.models, (tile) ->
                    str += JSON.stringify(tile.toJSON()) + ","
                str = str.substring(0,str.length-1)
                str += "],"
            str.substring(0,str.length-1) + "]"
        # Takes in x,y pixel coords and returns the model at that position
        getFromCoords: (x, y)->
            x /= 50
            y /= 50
            @get("rows")[y].at(x)

    $.getJSON "lib/json_packs/tiles.json", {}, (t) ->
        tiles = t
        # Initialize the tiles with common defaults
        _.each tiles, setDefaultTileAttrs

    setDefaultTileAttrs = (tile, key) -> 
        tile.url = _.template tileurl, tile
        tile.loaded = false
        if _.has tile, "subtypes"
            _.each tile["subtypes"], setDefaultTileAttrs

    # Takes in a string, for example "gwbr" and walks through the tiles object
    # until it finds an object and it returns the url for that parent
    getFromShorthand = (chars, nestedobj) ->
        if _.has(nestedobj, chars) then return nestedobj[chars]
        parent = chars.charAt 0
        if _.has nestedobj[parent], "subtypes"
            getFromShorthand chars.slice(1), nestedobj[parent].subtypes
        else nestedobj[parent]

    # Since PNG files are transparent and therefore unclickable in easel,
    # We add a "click area" to each tile
    createBitEventRegister = (bitmap, x, y) ->
        new createjs.Shape(new createjs.Graphics().beginFill("#f00").drawRect(0,0,50,50))


    loadChunkFromURL: (url) ->
        # $.getJSON "lib/json_packs/hometown.json"

    setTile = (tile) ->
        _.extend(_activechunk.children[tile.y].children[tile.x], _.omit(tile, "x", "y"))

    bindModel = (bitmap) ->
        model = bitmap.tileModel = new Tile(_.pick(bitmap, "x", "y", "e", "t", "end", "elv", "m"))
        model.bitmap = bitmap
        bitmap

    loadChunk = (map) ->
        bitmaparray = []
        _.each map, (tile) ->
            # Check if it's an array - if so, flatten to make sure only 2D
            if $.isArray tile
                if tile.length is 1 
                    extend = []
                    for i in [0...globals.map.width/tilewidth] then extend.push tile[0]
                bitmaparray.push loadChunk _.flatten(extend || tile)
            else
                if typeof tile == "object"
                    type = tile.t
                else type = tile
                temp = getFromShorthand type, tiles
                w = tile.width  || 1
                h = tile.height || 1
                bitmap = new createjs.Bitmap(temp.url)
                bitmap = _.extend(bitmap, (temp || {}), (tile || {}))
                # Create a new bitmap image, and extend the generic tile defaults onto it, followed by the specific tile settings
                bitmaparray.push(bindModel(bitmap))
        bitmaparray

    # We have wrapper each chunk in a container, so a simple remove (0) should suffice here
    clearChunk =  ->
        stage.removeChild _activechunk
        stage.removeChild _3dtiles

    renderChunk = (bitmap, vertindex) ->
        vertindex || vertindex = 0
        container = new createjs.Container()
        container.x = 0
        container.y = 0
        _.each bitmap, (tile, i) ->
            if $.isArray tile
                container.addChild(renderChunk tile, i)
            else
                tile.x = tilewidth * i
                tile.y = tileheight * vertindex
                tile.hitArea = createBitEventRegister(tile, tile.x, tile.y)
                if tile.t isnt "e" and tile.t isnt "p"
                    _3dtiles.addChild tile
                container.addChild tile
        stage.terrain = bitmap
        stage.addChild container
        container

    modifyBackground = (bitmap) ->
        board.setBackgroundPosition(bitmap.background_position || "top left")
        board.setBackground(bitmap.background || false)

    return window.mapper = {
        # Expects an array of 14x14 2D arrays, or chunks, each of which represents one full view in the map. 
        # Returns the bitmap 2d array for rendering by easel
        loadChunk: (chunk, x, y) ->
            if _cached_chunks[y][x] then return _cached_chunks[y][x]
            else 
                _activebitmap = loadChunk chunk.tiles
                _activebitmap = _cached_chunks[y][x] = _.extend _activebitmap, _.omit(chunk, "tiles")
        # Expects a bitmap (can be generated with loadMap) and a createjs stage. Will render the map to the stage
        # Returns a Container object with the bitmap inside it
        renderChunk: (bitmap) ->
            clearChunk()
            _3dtiles = new createjs.Container()
            _3dtiles.name = "3dtiles"
            container = renderChunk bitmap
            modifyBackground bitmap
            stage.addChild _3dtiles
            _activechunk = container 
        clearChunk: ->
            clearChunk()
        # Returns the container objects which have been rendered to the canvas
        getVisibleChunk: () ->
            _activechunk
        setTile: (tile) ->
            setTile tile
        # Given move deltas, retrieve the DisplayObject (bitmap) at that position in the current chunk
        getTargetTile: (dx, dy, start) ->
            if _activechunk
                _activechunk.children[(start.y+(50*dy))/50]?.children[(start.x+(50*dx))/50] || {}
        Tile: Tile
        Row: Row
        Chunk: Chunk
    }