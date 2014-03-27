define ["globals", "utilities", "backbone", "jquery", "underscore"], (globals, ut) ->



    t = ut.tileEntryCheckers
    _enterInfo = $("#modify-tile").html()
    # Reference to the currently open map overlay
    _overlay = null

    class Tile extends Backbone.Model
        defaults: 
            t: 'e'
            e: ''
            elv: 0
        initialize: (attrs) ->
            @on "expose", @expose
            attrs.x = @x
            attrs.y = @y
        expose: ->
            # mapper.setTile @attributes

    class Row extends Backbone.Collection
        model: Tile

    # Reference to all currently selected tiles
    window._selected = _selected = new Row

    class Chunk extends Backbone.Model
        defaults: ->
            rows = []
            for i in [0...globals.map.tileheight]
                rows[i] = row = new Row
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

    # Instantiate empty chunk of enterable spaces
    _chunk = new Chunk

    class Overlay extends Backbone.View
        el: '.enterable-list'
        initialize: () ->
            _.bindAll @, "render"
            @render()
        render: ->
            @$el.empty()
            _.each @model.get("rows"), (row) =>
                _.each row.models, (tile) =>
                    item = new OverlayItem model: tile
                    item.parent = @
                    tile.modifier = item
                    @$el.append(item.render().el)
        modifyAllTiles: (modal) ->
            _.each _selected.models, (tile) ->
                tile.modifier.applyChanges modal, false
            _selected.reset()

    class OverlayItem extends Backbone.View
        template: "<%= typeof e !== 'undefined' && e ? e : '&nbsp;' %><span class='elevation'><%= elv %></span>"
        tagName: 'li'
        initialize: ->
            @listenTo @model, {
                "change": @render
                "modification": @modifyTileInfo
            }    
        # Handles the view and array modification 
        modifyTileInfo: ->
            if _selected.length > 1 then multi = true else multi = false
            tile = @model
            if multi then str = "<h3>Editing Many</h3>" else str = ""
            modal = ut.launchModal(str + _.template(_enterInfo, _.extend(tile.toJSON(), {x: tile.x, y: tile.y})))
            modal.find(".js-add-elevation").select()
            modal.on("keydown", ".js-add-dirs, .js-add-elevation", (e) =>
                key = e.keyCode || e.which
                if key == 13
                    if multi
                        @parent.modifyAllTiles modal
                    @applyChanges(modal)
            )
            tile
         # grab the content of the dir box and set to tiler
        applyChanges: (modal, proceed) ->
            @model.set "e", modal.find(".js-add-dirs").val()
            @model.set "elv", parseInt(modal.find(".js-add-elevation").val())
            ut.destroyModal()
            @$el.removeClass "selected-tile"
            @model.trigger "expose"
            unless proceed is false
                next = getNextTile(@model.x,@model.y)
                if next.tile then next.tile.modifier.modifyTileInfo modal, proceed
        render: ->
            @$el.html(_.template(@template, @model.toJSON()))
            @
        events: 
            click: (e) ->
                @$el.toggleClass("selected-tile")
                e.preventDefault()
                unless e.shiftKey
                    model = @model
                    _selected.add @model
                    @modifyTileInfo()
                else 
                    if _selected.indexOf(@model) != -1 
                        _selected.remove(@model.cid)
                    else
                        _selected.add @model

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
            ut.launchModal new Chunk().export()
        bindCreators: (tile) ->
        loadChunk: (precursor_chunk) ->
            chunk = new Chunk
            allRows = []
            # Deep copy
            _.each precursor_chunk, (row, i) ->
                rowCollection = new Row
                _.each row, (tile, j) ->
                    tile = _.pick tile, "t", "e", "elv"
                    rowCollection.add TileModel = new Tile(tile)
                    TileModel.x = j
                    TileModel.y = i
                    TileModel.set {x: j, y: i}
                allRows[i] = rowCollection
            chunk.set("rows", allRows)
            _chunk = chunk
            toggleOverlay()
            toggleOverlay()
            _chunk = chunk
        exportMap: exportMap

    }   