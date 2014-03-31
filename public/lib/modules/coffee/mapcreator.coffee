define ["globals", "utilities", "mapper", "backbone", "jquery", "jquery-ui", "underscore"], (globals, ut, mapper) ->


    t = ut.tileEntryCheckers
    _enterInfo = $("#modify-tile").html()
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
    _chunk = new Chunk

    class Overlay extends Backbone.View
        el: '.enterable-list'
        initialize: (opts) ->
            @child = opts.child
            _.bindAll @, "render"
            @render()
        render: ->
            @$el.empty()
            _.each @model.get("rows"), (row) =>
                _.each row.models, (tile) =>
                    item = @child || OverlayItem
                    item = new item model: tile
                    item.parent = @
                    tile.modifier = item
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
        # Handles the view and array modification 
        modifyTileInfo: ->
            ut.c "modiying tile info"
            if _selected.length > 1 then multi = true else multi = false
            tile = @model
            if multi then str = "<h3>Editing Many</h3>" else str = ""
            modal = ut.launchModal(str + _.template(_enterInfo, _.extend(tile.toJSON(), {x: tile.x, y: tile.y})))
            modal.find(".js-add-elevation").select()
            self = @
            modal.on("keydown", ".js-add-dirs, .js-add-elevation, .js-add-type", (e) ->
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
            if modal.find(".js-add-type").inputChanged()
                @model.set "t", modal.find(".js-add-type").val()
            if modal.find(".js-add-dirs").inputChanged()
                @model.set "e", modal.find(".js-add-dirs").val()
            if modal.find(".js-add-elevation").inputChanged() 
                @model.set "elv", parseInt(modal.find(".js-add-elevation").val())
            ut.destroyModal()
            @model.trigger "expose"
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

    # Takes in a json array containing string representations of functions 
    # and converts them to direct references to the function (a member of ut.tileEntryCheckers)

    # Give a tile coord set and this finds the next tile, ltr preferential
    getNextTile = (x,y) ->
        if x < 19
            x++
            return {tile: _chunk.get("rows")[y].at(x), y: y, x: x}
        else if x is 19 and y < 13 
            y++
            return {tile: _chunk.get("rows")[y].at(0), y: y, x: 0}
        else null

    toggleOverlay = ->
        if !_overlay
            _overlay = new Overlay model: _chunk
        else 
            _overlay.$el.empty()
            _overlay = null


    exportMap = ->
        _.each _chunk.get("rows"), (row) ->
            _.each row.models, (tile) ->
                if !tile.get("elv") then tile.set "elv" , 0
        m = ut.launchModal("<textarea>" + _chunk.export() + "</textarea>")
        # ut.c _chunk
        m.find("textarea").select()
    return {
        toggleOverlay: toggleOverlay
        getDefaultChunk: ->
            JSON.parse new Chunk().export()
        # Accepts a bitmaparray and binds a tile model to each bitmap. Easel js needs a DisplayObject format
        # to render properly, but some features require backbone models. this binds a model to each bitmap
        bindModels: (bitmaparray, x, y) ->
            chunk = _cached_chunks[y][x]
            _.each bitmaparray, (row, j) ->
                _.each row, (tile, i) ->
                    model = chunk.get("rows")[j].at(i)
                    tile.tileModel = model
                    model.bitmap = tile
            chunk
        loadChunk: (precursor_chunk, x, y) ->   
            if _cached_chunks[y][x] then return _cached_chunks[y][x]
            chunk = new Chunk
            allRows = []
            # Deep copy
            _.each precursor_chunk, (row, i) ->
                rowCollection = new Row
                _.each row, (tile, j) ->
                    tile = _.pick tile, "t", "e", "elv", "end", "m"
                    rowCollection.add TileModel = new Tile(tile)
                    TileModel.x = j
                    TileModel.y = i
                    tile.model = TileModel
                    TileModel.set {x: j, y: i}
                allRows[i] = rowCollection
            chunk.set("rows", allRows)
            _chunk = chunk
            # toggleOverlay()
            # toggleOverlay()
            _cached_chunks[y][x] = _chunk = chunk

        getChunk: -> _chunk
        exportMap: exportMap
        Overlay: Overlay
        OverlayItem: OverlayItem
    }   