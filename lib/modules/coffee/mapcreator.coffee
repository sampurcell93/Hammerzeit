define ["globals", "utilities", "backbone", "jquery", "underscore"], (globals, ut) ->

    class Tile extends Backbone.Model
        defaults: 
            t: 'e'
            e: ''
        initialize: (attrs) ->
            @set attrs
    class Row extends Backbone.Collection
        model: Tile

    class Chunk extends Backbone.Model
        defaults: ->
            rows = []
            for i in [0...globals.map.tileheight]
                rows[i] = row = new Row
                for j in [0...globals.map.tilewidth] then row.add new Tile({t: 'e'})
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


    t = ut.tileEntryCheckers
    _enterInfo = $("#modify-tile").html()

    # Instantiate empty chunk of enterable spaces
    _chunk = new Chunk
    

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
            return {tile: _chunk.get("rows")[y].at(x), y: y, x: x}
        else if x is 19 and y < 13 
            y++
            return {tile: _chunk.get("rows")[y].at(0), y: y, x: 0}
        else null

    # grab the content of the dir box and set to tile
    applyDirs = (tile, x, y) ->
        v = @val()
        tile.set "e",  v

    # Get content of elevation box and set
    applyElevation = (tile, x, y) ->
        v = @val()
        tile.set "elv", parseInt(v)


    applyChanges = (modal, tile, x, y) ->
        applyDirs.call(modal.find(".js-add-dirs"), tile, x, y)
        applyElevation.call(modal.find(".js-add-elevation"), tile, x, y)
        ut.destroyModal()
        next = getNextTile(x,y)
        modifyTileInfo(next.tile, next.x, next.y)

    # Handles the view and array modification 
    modifyTileInfo = (tile, x, y) ->
        if !tile? then return null
        modal = ut.launchModal("x: " + x + "<br />y: " + y + _.template(_enterInfo, tile.toJSON()))
        modal.find(".js-add-dirs").select()
        modal.on("keydown", ".js-add-dirs, .js-add-elevation", (e) ->
            key = e.keyCode || e.which
            if key == 13 then applyChanges(modal, tile, x, y)

        )
        tile

    class Overlay extends Backbone.View
        el: '.enterable-list'
        initialize: () ->
            _.bindAll @, "render"
            @render()
        render: ->
            @$el.empty()
            console.log @model
            _.each @model.get("rows"), (row) =>
                _.each row.models, (tile) =>
                    item = new OverlayItem model: tile
                    @$el.append(item.render().el)

    class OverlayItem extends Backbone.View
        template: "<%= typeof e !== 'undefined' && e ? e : 'e' %>"
        tagName: 'li'
        initialize: ->
            @listenTo @model, {
                "change:e": @render
            }
        render: ->
            @$el.html(_.template(@template, @model.toJSON()))
            @


    exportMap = ->
        _.each _chunk.get("rows"), (row) ->
            _.each row.models, (tile) ->
                if !tile.get("elv") then tile.set "elv" , 0
        m = ut.launchModal("<textarea>" + _chunk.export() + "</textarea>")
        # ut.c _chunk
        m.find("textarea").select()
        new Overlay model: _chunk

    return {
        getDefaultChunk: ->
            new Chunk
        bindCreators: (tile) ->
            if globals.dev 
                tile.addEventListener "click", ->
                    ut.c tile
                    coords = getArrayPos tile.x, tile.y
                    modifyTileInfo _chunk.get("rows")[coords.y].at(coords.x), coords.x, coords.y
                tile.addEventListener "pressmove", ->
                    exportMap()
        loadChunk: (precursor_chunk) ->
            chunk = new Chunk
            allRows = []
            # Deep copy
            _.each precursor_chunk, (row, i) ->
                rowCollection = new Row
                _.each row, (tile) ->
                    rowCollection.add new Tile(tile)
                allRows[i] = rowCollection
            chunk.set("rows", allRows)
            _chunk = chunk
        exportMap: ->
            exportMap()
        # Expects the tile and the tile's x y array coordinates
        modifyTileInfo: (tile, x, y) ->
            modifyTileInfo tile

    }