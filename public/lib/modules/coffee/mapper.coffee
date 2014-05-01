define ["globals", "utilities", "board"], (globals, ut, board) ->
    tileurl      = 'images/tiles/<%=name%>.<%=typeof filetype !== "undefined" ? filetype : "jpg" %>'
    tilewidth    = tileheight = 50
    tiles        = null
    _activechunk = null
    _activebitmap = null
    _backbone = null
    stage = board.getStage()
    _checkEntry = ut.tileEntryCheckers

    _cached_chunks = []
    for i in [0..3] then _cached_chunks[i] = []


    class Overlay extends Backbone.View
        el: '.enterable-list'
        initialize: (opts) ->
            @child = opts.child
            _.bindAll @, "render"
        render: ->
            if !@model then return @
            @$el.empty()
            _.each @model.get("rows"), (row) =>
                _.each row.models, (tile) =>
                    item = @child || OverlayItem
                    item = new item model: tile
                    item.parent = @
                    if item instanceof OverlayItem then tile.modifier = item
                    @$el.append(item.render().el)
        modifyAllTiles: (modal) ->
            ut.c "modding all", _selected
            _.each _selected.models, (tile) ->
                tile.modifier.applyChanges modal, false
            _selected.reset()


    class OverlayItem extends Backbone.View
        template: $("#mapcreate-item").html()
        tagName: 'li'
        initialize: ->
            @listenTo @model, {
                "change": @render
                "modification": @modifyTileInfo
            }    
            enterInfo = $("#modify-tile").html()
            # Handles the view and array modification 
            @modifyTileInfo = ->
                ut.c "modiying tile info"
                if _selected.length > 1 then multi = true else multi = false
                tile = @model
                if multi then str = "<h3>Editing Many</h3>" else str = ""
                modal = ut.launchModal(str + _.template(enterInfo, _.extend(tile.toJSON(), {x: tile.x, y: tile.y})))
                modal.find(".js-add-elevation").select()
                self = @
                modal.on("keydown", ".js-change", (e) ->
                    key = e.keyCode || e.which
                    if key != 9 then $(@).attr("changed", true)
                    if key == 13
                        if multi
                            self.parent.modifyAllTiles modal
                        else 
                            self.applyChanges modal
                            _selected.remove self.model.cid
                )
                tile
         # grab the content of the dir box and set to tiler
        applyChanges: (modal, proceed) ->
             # Give a tile coord set and this finds the next tile, ltr preferential
            getNextTile = (x,y) =>
                if x < 19
                    x++
                    return {tile: @parent.model.get("rows")[y].at(x), y: y, x: x}
                else if x is 19 and y < 13 
                    y++
                    return {tile: @parent.model.get("rows")[y].at(0), y: y, x: 0}
                else null
            self = @
            # modal.find(".js-change").each >
            #     $t = $ @
            #     if $t.inputChanged()
            #         self.model.set $t.data("changeme"), $t.val()
            if modal.find(".js-diff").inputChanged()
                @model.set "m", parseInt(modal.find(".js-diff").val())
            if modal.find(".js-can-end").inputChanged()
                @model.set "end", ut.parseBool(modal.find(".js-can-end").val())
            if modal.find(".js-add-type").inputChanged()
                @model.set "t", modal.find(".js-add-type").val()
            if modal.find(".js-add-dirs").inputChanged()
                @model.set "e", modal.find(".js-add-dirs").val()
            if modal.find(".js-add-elevation").inputChanged() 
                @model.set "elv", parseInt(modal.find(".js-add-elevation").val())
            ut.destroyModal()
            @model.expose()
            @unselect()
            unless proceed is false
                next = getNextTile(@model.x,@model.y)
                if next.tile then next.tile.modifier.modifyTileInfo modal, proceed
        render: ->
            @$el.html(_.template(@template, @model.toJSON()))
            @
        select: ->
            @$el.addClass("selected-tile")
            @selected = true
            _selected.add @model
        unselect: ->
            @$el.removeClass("selected-tile")
            @selected = false
        events: 
            select: "select"
            unselect: "unselect"
            click: (e) ->
                e.preventDefault()
                unless e.shiftKey
                    @select()
                    @modifyTileInfo()
                else 
                    if @selected is true then @unselect()
                    else @select()


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
            @on "change:occupied_by", (model, value) =>
                
        expose: ->
            setTile @attributes
            @
        removePotentialMovePath: ->
            @pathFromStart.path = []
            @trigger "removemove"
            @
        isOccupied: -> @get("occupied") is true
        getOccupant: -> @get("occupied_by")
        occupy: (obj) ->
            @set "occupied", true
            @set "occupied_by", obj
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
        leave: ->
            @set "occupied", false
            @set "occupied_by", null
            @
        # Returns if a square is too high to enter
        tooHigh: (start, jump) ->
            !(Math.abs(start.elv - @get("elv")) > jump)

    class Row extends Backbone.Collection
        model: Tile
        getOccupied: (opts={reject: -> false}) -> 
            new Row(_.filter @models, (model) => 
                model.isOccupied() and !opts.reject(model)
            )

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

    # We have wrapper each chunk in a container, so a simple remove (0) should suffice here
    clearChunk =  ->
        stage.removeChild _activechunk
        stage.removeChild _3dtiles

    class Chunk 
        constructor: ->
            @container = new createjs.Container()
            for i in [0..18]
                @container.children[i] = new createjs.Container()
                for j in [0..13]
                    @container.children[i].children[j] = new Tile()
            @
        export: -> @container
        plain: -> 
            arr = []
            for i in [0..18]
                arr[i] = []
                for j in [0..13]
                    arr[i][j] = {}



    renderChunk = (bitmap, vertindex=0) ->
        # 3d tiles have to be drawn after the players and npcs, because they overshadow them
        _3dtiles = new createjs.Container()
        container = new createjs.Container()
        container.x = 0
        container.y = 0
        _.each bitmap, (tile, i) ->
            if _.isArray(tile)
                container.addChild renderChunk tile, i
            else
                if typeof tile == "object"
                    type = tile.t
                else type = tile
                w = tile.width  || 1
                h = tile.height || 1
                processed = new createjs.Bitmap("images/tiles/p.png")
                # Create a new bitmap image, and extend the generic tile defaults onto it, followed by the specific tile settings
                processed.x = tilewidth * i
                processed.y = tileheight * vertindex
                processed.hitArea = createBitEventRegister(tile, tile.x, tile.y)
                processed = _.extend processed, {tileModel: new Tile(tile)}
                processed.tileModel.bitmap = processed
                if tile.t isnt "e" and tile.t isnt "p"
                    _3dtiles.addChild processed
                container.addChild processed
        stage.terrain = bitmap
        stage.addChild container
        container

    modifyBackground = (bitmap) ->
        board.setBackgroundPosition(bitmap.background_position || "top left")
        board.setBackground(bitmap.background || false)

    return window.mapper = {
        # # Expects an array of 14x14 2D arrays, or chunks, each of which represents one full view in the map. 
        # # Returns the bitmap 2d array for rendering by easel
        # loadChunk: (chunk, x, y, render=false, cache=true) ->
        #     if _cached_chunks[y][x] then return _cached_chunks[y][x]
        #     else 
        #         bitmap = loadChunk(chunk)
        #         if cache
        #             _activebitmap = _cached_chunks[y][x] = bitmap
        #     if render is true then @renderChunk _activebitmap
        #     bitmap
        # # Expects a bitmap (can be generated with loadMap) and a createjs stage. Will render the map to the stage
        # # Returns a Container object with the bitmap inside it
        # renderChunk: (bitmap) ->
        #     clearChunk()
        #     _3dtiles = new createjs.Container()
        #     _3dtiles.name = "3dtiles"
        #     container = renderChunk bitmap
        #     modifyBackground bitmap
        #     stage.addChild _3dtiles
        #     _activechunk = container 
        # chunkifyBitmap: (bitmap) ->
        #     _activebitmap
        clearChunk: ->
            clearChunk()
        # # Returns the container objects which have been rendered to the canvas
        # # If chunk is set to true, returns the bitmap as a chunkified model
        # getVisibleMap: (chunky=false) ->
        #     console.log _activebitmap
        #     if !chunky then _activebitmap
        #     else @chunkifyBitmap _activebitmap
        setTile: (tile) ->
            setTile tile
        # # Given move deltas, retrieve the DisplayObject (bitmap) at that position in the current chunk
        Tile: Tile
        Row: Row
        Overlay: Overlay
        getTargetTile: (dx=0, dy=0, start,chunk=_activechunk) -> 
            if chunk
                y = (start.y+(50*dy))/50
                x = (start.x+(50*dx))/50
                chunk.children[y]?.children[x] || {}
        # Expects a 2d array of tile objects and returns a createjs container
        # with bound tile models
        mapFromPrecursor: (precursor) ->
            modifyBackground precursor
            _activechunk = renderChunk precursor.tiles
            globals.shared_events.trigger "map:change", _activechunk
            _activechunk
        getVisibleMap: -> _activechunk
        getEmptyMap: -> 
            c = new Chunk()
            console.log c.export()
            c.export()
    }