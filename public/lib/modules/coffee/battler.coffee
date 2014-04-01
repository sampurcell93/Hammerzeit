define ["board", "globals", "utilities", "mapper", "npc", "mapcreator", "player", "backbone", "underscore", "jquery"], (board, globals, ut, mapper, NPC, mapcreator, player) ->

    _shared = globals.shared_events
    _shared.on "battle", ->
        activateGrid()
    _grid = null
    _gridded = false
    _activemap = null
    stage = board.getStage()
    _side = globals.map.tileside

    class Overlay extends mapcreator.Overlay
        show: -> @$el.fadeIn  "fast"
        hide: -> @$el.fadeOut "fast"
        modifyAllTiles: ->


    class GridSquare extends Backbone.View
        tagName: 'li'
        template: "&nbsp;"
        colors: {
            selected_move: "green"
            potential_move: "#ea0000"
        }
        initialize: ->
            @listenTo @model,
                potentialmove: @potentialmoves
                removemove: @removepotential

        render: ->
            @model.square = @
            @$el.html(_.template @template, @model.toJSON())
            @
        # handler for click event on 
        clickHandler: (e, data) -> 
            console.log "you clicked the area"
            console.log arguments
        mouseoverHandler: (e, data) ->
            data.area.graphics.clear().beginFill(@colors.selected_move).drawRect(0, 0, _side-2, _side-2).endFill();
        mouseoutHandler: (e, data) ->
            data.area.graphics.clear().beginFill(@colors.potential_move).drawRect(0, 0, _side-2, _side-2).endFill();
        bindMoveFns: (area) ->
            area.on "click" , @clickHandler, @, false, area: area
            area.on "mouseover", @mouseoverHandler, @, false, area: area
            area.on "mouseout", @mouseoutHandler, @, false, area: area
        # Pass in a stringto identify why a grid square should be highlighted
        potentialmoves: () ->
            console.log("highlighting potential")
            @$el.addClass("potentialmove")
            @potentialmoves = true
            bitmap = @model.bitmap
            area = bitmap.hitArea
            if area.drawn?
                stage.addChildAt(area, 0)
                return @
            area.drawn = true
            g = area.graphics
            area.x = bitmap.x - 1
            area.y = bitmap.y - 1
            g.clear().beginFill(@colors.potential_move).drawRect(0, 0, _side - 2, _side - 2).endFill()
            area.alpha = 0.3
            @bindMoveFns(area)
            stage.addChildAt(area, 0)
            @
            console.log area
        removepotential: -> 
            # classes = @$el.classes()
            # _.each classes, (cl) =>
            #     if cl.indexOf("highlight") != -1 then @$el.removeClass cl
            @$el.removeClass("potentialmove")
            @potentialmoves = false
            bitmaphit = @model.bitmap.hitArea
            bitmaphit.off "click"
            stage.removeChild bitmaphit
        events: ->
            "click": -> console.log "hitarea"
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
        console.log _activemap
        if !_grid
            _grid = new Overlay 
                model: _activemap,
                el: ".battle-grid-overlay",
                child: GridSquare
        else 
            _grid.model = _activemap
            _grid.render()
            _grid.show()
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
