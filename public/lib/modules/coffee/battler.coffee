define ["board", "globals", "utilities", "mapper", "npc", "mapcreator", "player", "backbone", "underscore", "jquery"], (board, globals, ut, mapper, NPC, mapcreator, player) ->

    PCs = player.PCs
    NPCArray = NPC.NPCArray
    NPC = NPC.NPC
    stage = board.getStage()
    map = globals.map


    class Battle extends Backbone.Model
        battleDir: globals.battle_dir
        defaults: 
            NPCs: new NPCArray
            avglevel: PCs.getAverageLevel()
            numenemies: Math.ceil(Math.random() * PCs.length * 2 + 1)
            enemyBounds: {
                min_x: 0
                max_x: map.c_width
                min_y: 0
                max_y: map.c_height
            }

        load: (id) ->
            $.getJSON @battle_dir + id, (battle) ->
                console.log battle
        # A function for creating a random battle, within parameters (or NOT?!!)
        randomize: (o) ->
            o = _.extend @defaults, o
            console.log o
            for i in [0...o.numenemies]
                @get("NPCs").add(n = new NPC level: o.avglevel)
                n.marker.x = 50*i
                n.marker.y = 50*i
                square =  n.setCurrentSpace()
                console.log square
                ct = 0
                while square.end is false or square.e is "f"
                    n.marker.x = 50*(i+ct)
                    n.marker.y = 50*(i+ct)
                    ct++
                    square = n.setCurrentSpace()
                board.addMarker n

            @
        destroy: ->
            @destructor()
            super
        destructor: ->
            NPCs = @get("NPCs")
            while npc = NPCs.first()
                npc.leaveSquare()
                stage.removeChild npc.marker
                npc.destroy()


    _active_chars = PCs
    # _active_chars.add player.PCs
    console.log _active_chars
    _shared = globals.shared_events
    _shared.on "battle", ->
        _grid.activate()
    _activemap = null
    _side = globals.map.tileside
    _currentbattle = null

    # Keeps track of timed events in the battle field
    # When done, triggers a shared event so other modules know
    class Timer
        constructor: (@el, @number) -> 
        interval: null
        totaltime: 20000
        stop: -> if @interval then clearInterval @interval
        start: ->
            @show()
            value  = parseInt @el.attr("value")
            @number.text((@totaltime*.001 - value*.001) + "s")
            @interval = setInterval =>
                value += 50
                @el.attr("value", value)
                if value % 1000 is 0 then @number.text((@totaltime*.001 - value*.001) + "s")
                if value >= @totaltime
                    clearInterval @interval
                    globals.shared_events.trigger "timerdone"
            , 50
        reset: -> 
            @stop()
            @el.attr("value", 0)
        show: -> 
            board.$canvas.addClass("nocorners")
            @el.fadeIn "fast"
            @number.fadeIn "fast"
        hide: -> 
            board.$canvas.removeClass("nocorners")
            @number.fadeOut "fast"
            @el.fadeOut "fast"
        set: (time) ->
            if time >= 0 and time <= @totaltime
                @el.attr("value", time)
 
    _timer = new Timer($("#turn-progress"),$("#turn-progress-number"))


    class GridOverlay extends mapcreator.Overlay
        show: -> @$el.fadeIn  "fast"
        hide: -> @$el.fadeOut "fast"
        el: ".battle-grid-overlay"
        showing: false
        modifyAllTiles: ->
        render: -> 
            super
            console.log "rendering"
            console.log @model
        toggle: ->
            if @showing is false then @activate()
            else @deactivate()
        activate:  ->
            @model = _activemap
            @render()
            @show()
            @showing = true
        deactivate: ->
            @hide()
            @showing = false

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

    _grid = new GridOverlay child: GridSquare

    window.battler = {
        getActivePlayer: ->
            # getActivePlayer()
            player.PC
        toggleGrid: ->
            _activemap = mapcreator.getChunk()
            _grid.toggle()
        activateGrid: ->
            _activemap = mapcreator.getChunk()
            _grid.activate()
        deactivateGrid: ->
            _grid.deactivate()
        getActiveMap: -> 
            _activemap
        # Because of the game's combination of real time and RPG playing, we're using a timer! 
        # Will be an HTML5 progress element
        showTimer: ->
            _timer.show()
            @
        hideTimer: ->
            _timer.hide()
            @
        # Set the timer to some ms value - this does not change the total runtime of the timer
        setTimer: (time) ->
            _timer.set time
            @
        startTimer: ->
            _timer.start()
            @
        stopTimer: ->
            _timer.stop()
            @
        resetTimer: ->
            _timer.reset()
            @
        setTotalTime: (total) ->
            _timer.setTotalTime()
            @
        Battle: Battle
        randomBattle: ->
            if _currentbattle then _currentbattle.destroy()
            _currentbattle = b = new Battle()
            b.randomize()
    }   
