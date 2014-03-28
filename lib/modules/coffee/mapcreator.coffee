define ["globals", "utilities", "mapper", "backbone", "jquery", "jquery-ui", "underscore"], (globals, ut, mapper) ->


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
            mapper.setTile @attributes

    class Row extends Backbone.Collection
        model: Tile

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
            ut.c "modding all", _selected
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
            ut.c "modiying tile info"
            if _selected.length > 1 then multi = true else multi = false
            tile = @model
            if multi then str = "<h3>Editing Many</h3>" else str = ""
            modal = ut.launchModal(str + _.template(_enterInfo, _.extend(tile.toJSON(), {x: tile.x, y: tile.y})))
            modal.find(".js-add-elevation").select()
            self = @
            modal.on("keydown", ".js-add-dirs, .js-add-elevation", (e) ->
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