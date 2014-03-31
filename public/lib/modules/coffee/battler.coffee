define ["board", "globals", "utilities", "mapper", "npc", "mapcreator", "player", "backbone", "underscore", "jquery"], (board, globals, ut, mapper, NPC, mapcreator, player) ->

    _shared = globals.shared_events
    _shared.on "battle", ->
        activateGrid()
    _grid = null
    _gridded = false
    _activemap = null

    class Overlay extends mapcreator.Overlay
        show: -> @$el.fadeIn  "fast"
        hide: -> @$el.fadeOut "fast"
        modifyAllTiles: ->


    class GridSquare extends Backbone.View
        tagName: 'li'
        template: "&nbsp;"
        initialize: ->
            @listenTo @model,
                potentialmove: -> 
                    @potentialmove = true
                    @highlight()
                unhighlight: ->
                    @unhighlight
                    @removepotential()
        render: ->
            @model.square = @
            @$el.html(_.template @template, @model.toJSON())
            @
        # Pass in a stringto identify why a grid square should be highlighted
        highlight: (type) ->
            @$el.addClass("highlight-" + (type || "potentialmove"))
        unhighlight: -> 
            classes = @$el.attr("class").split " "
            @$el.removeClass()
            _.each classes, (cl) ->
                if cl.indexOf("highlight") != -1 then cl = ""
            @$el.addClass classes.join " "
        removepotential: -> 
            @potentialmove = false
        events: ->
            mouseover: (e) ->
                if @potentialmove then @$el.addClass("selecting-move")
            mouseout: ->
                if @potentialmove then @$el.removeClass("selecting-move")

    _board = null

    # Functions for toggling grid functionality....
    toggleGrid = ->
        if _gridded is false then activateGrid()
        else deactivateGrid()

    activateGrid = ->
        _activemap = mapcreator.getChunk()
        if !_grid
            _grid = new Overlay 
                model: _activemap,
                el: ".battle-grid-overlay",
                child: GridSquare
        else _grid.show()
        _gridded = true

    deactivateGrid = ->
        _grid.hide()
        _gridded = false

    {
        loadBoard: (board) ->
            _board = board
        getActivePlayer: ->
            # getActivePlayer()
            player.PC
        # Add npc to current board
        addNPC: (NPC, x, y) ->
        toggleGrid: ->
            toggleGrid()
        activateGrid: ->
            activateGrid()
        deactivateGrid: ->
            deactivateGrid()
        getActiveMap: -> 
            console.log "getting activemap"
            console.log _activemap
            _activemap

    }   
