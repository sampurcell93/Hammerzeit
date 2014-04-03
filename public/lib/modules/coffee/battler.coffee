define ["board", "globals", "utilities", "mapper", "npc", "mapcreator", "player", "backbone", "underscore", "jquery"], (board, globals, ut, mapper, NPC, mapcreator, player) ->

    PCs = player.PCs
    NPCArray = NPC.NPCArray
    NPC = NPC.NPC
    stage = board.getStage()
    map = globals.map
    # Standard modifier (d20)
    _sm = 20
    _ts = globals.map.tileside
    _potential_moves = null

    # Simple circular queue
    class ActivityQueue extends NPCArray
        current_index: 0
        type: 'ActivityQueue'
        initialize: (models) ->
            _.bindAll @, "next", "prev", "getActive"
            # When a player/npc says theire turn is done, advance the queue
            @on 
                "turndone": @next
            _.each models, (character) => character.trigger("add", character, @, {})
        model: (attrs, options) ->
            switch attrs.type
              when 'player' then m = new player.model attrs, options
              when 'npc' then m = new NPC attrs, options
            # Deflects against multiple collections
            m.queue = @
            m
              # should probably add an 'else' here so there's a default if,
              # say, no attrs are provided to a Logbooks.create call
        comparator: (model) -> model.i = model.get("init") + Math.ceil(Math.random()*_sm)
        # returns the pc or npc at the top of the queue
        getActive: (opts) -> 
            opts = _.extend {player: false}, opts
            active = @at @current_index
            if opts.player is true and active instanceof player.model is false then return null
            else return active
        # Advance the queue and start the new character's turn by default. 
        # Pass in false to prevent this.
        next: (init) -> 
            num = @current_index = ++@current_index % @length
            unless init is false then @getActive().initTurn()
            num
        # Shifts the queue back by one!
        prev: -> 
            @current_index--
            if @current_index < 0 then @current_index = @length - 1


    class Battle extends Backbone.Model
        states: []
        defaults: 
            NPCs: new NPCArray
            AllCharacters: new ActivityQueue(PCs.models)
            avglevel: PCs.getAverageLevel()
            numenemies: Math.ceil(Math.random() * PCs.length * 2 + 1)
            enemyBounds: {
                min_x: 0
                max_x: map.c_width
                min_y: 0
                max_y: map.c_height
            }
        addState: (newstate) ->
            if @hasState(newstate) is false
                @states.push newstate
        setState: (newstate) ->
            @states = [newstate]
            @
        removeState: (removeme) ->
            if @states.length > 1
                index = @states.indexOf removeme
                @states.splice(index, 1) unless index == -1
            else throw new Error("The board currently has only one state - you can't remove it. Try adding another state first.")
            @
        hasState: (checkstate) ->
            @states == checkstate.toUpperCase()

        initialize: ->
            @listenTo @get("NPCs"), 
                die: @checkStillLiving

        checkStillLiving: (model, collection, options) ->
            if collection
                flag = true
                _.each collection.models, (character) =>
                    if character.dead is false then flag = false
                return flag
            false
        addPCs: ->
            _.each PCs.models, (pc, i) ->
                unless i is 0
                    pc.addToMap()
                    board.addMarker pc
        begin: (type, opts)->
            @addPCs()
            if type is "random" then @randomize(opts)
            else @load type

        load: (id) ->
            $.getJSON globals.battle_dir + id, (battle) ->
                console.log battle
        # A function for creating a random battle, within parameters (or NOT?!!)
        randomize: (o) ->
            o = _.extend @defaults, o
            console.log @
            for i in [0...o.numenemies]
                @get("NPCs").add(n = new NPC level: o.avglevel)
                @get("AllCharacters").add n
                n.addToMap()
                board.addMarker n
            @get("AllCharacters").sort()
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

    _activebattle = new Battle
    _active_chars = PCs
    # _active_chars.add player.PCs
    console.log _active_chars
    _shared = globals.shared_events
    _shared.on "battle", ->
        _grid.activate()
        b = _activebattle = new Battle
        b.begin "random"
    _activemap = null
    _ts = globals.map.tileside

    # Keeps track of timed events in the battle field
    # When done, triggers a shared event so other modules know
    class Timer
        constructor: (@el, @number) -> 
        interval: null
        totaltime: 10000
        stop: -> if @interval then clearInterval @interval
        start: (extra, done) ->
            @show()
            value  = parseInt @el.attr("value")
            extra || extra = 0
            totaltime = @totaltime + extra*100
            @el.attr("max", totaltime)
            @interval = setInterval =>
                value += 50
                @el.attr("value", value)
                # The position of the number
                numpos = ((totaltime-value)/totaltime)*100-1
                @number.text((Math.round((totaltime*.001 - value*.001)/.1)*.1).toFixed(1) + "s")
                if numpos > 0
                    @number.css("right", numpos + "%")
                if value >= totaltime
                    clearInterval @interval
                    globals.shared_events.trigger "timerdone"
                    if done? and _.isFunction(done) then done()
            , 50
        reset: -> 
            @stop()
            @el.attr("value", 0)
        show: -> 
            board.$canvas.addClass("nocorners")
            @el.slideDown "fast"
            @number.fadeIn "fast"
        hide: -> 
            board.$canvas.removeClass("nocorners")
            @number.fadeOut "fast"
            @el.slideUp "fast"
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
            general: 'blue'
        }
        initialize: ->
            @listenTo @model,
                potentialmove: @potentialmoves
                removemove: @removepotential
                generalhighlight: @highlight
            @setUpHitArea()
        setUpHitArea: ->
            o = Math.ceil(@model.get("elv") / 5)
            if o < -5 then o = -5 else if o > 5 then o = 5
            bitmap = @model.bitmap
            if o then console.log o, bitmap.x, bitmap.y
            bitmap.x += o
            bitmap.y += o
            area = bitmap.hitArea
            area.x = bitmap.x - 1
            area.y = bitmap.y - 1
            @
        render: ->
            @model.square = @
            @$el.html(_.template @template, @model.toJSON())
            @
        # handler for click event on 
        clickHandler: (e, data) -> 
            console.log "you clicked the area"
            console.log arguments
            console.log @model
            active = getActive()
            path = @model.pathFromStart.path
            moveInterval = =>
                if _.isEmpty(path)
                    @stopListening active, "donemoving"
                    clearPotentialMoves()
                    _potential_moves = active.virtualMovePossibilities()
                    active.takeMove()
                else
                    deltas = path[0]
                    dx = deltas.dx
                    dy = deltas.dy
                    active.moveInterval(dx,dy)
                    path.shift()
            do moveInterval
            @listenTo active, "donemoving", -> setTimeout moveInterval, 70
        mouseoverHandler: (e, data) ->
            data.area.graphics.clear().beginFill(@colors.selected_move).drawRect(0, 0, _ts, _ts).endFill();
            board.mainCursor().show().move @model.bitmap
            @
        mouseoutHandler: (e, data) ->
            board.mainCursor().hide()
            data.area.graphics.clear().beginFill(@colors.potential_move).drawRect(0, 0, _ts, _ts).endFill();
            @
        bindMoveFns: (area) ->
            area.on "click" , @clickHandler, @, false, area: area
            area.on "mouseover", @mouseoverHandler, @, false, area: area
            area.on "mouseout", @mouseoutHandler, @, false, area: area
        highlight: ->
            console.log "highlighting"
            console.log arguments
            bitmap = @model.bitmap
            area = bitmap.hitArea
            g = area.graphics

        # Pass in a stringto identify why a grid square should be highlighted
        potentialmoves: () ->
            console.log("highlighting potential")
            @haspotentialmoves = true
            bitmap = @model.bitmap
            area = bitmap.hitArea
            g = area.graphics
            g.clear().beginFill(@colors.potential_move).drawRect(0, 0, _ts, _ts).endFill()
            area.alpha = 0.3
            area.drawn = true
            @bindMoveFns(area)
            stage.addChildAt(area, 0)
            @
            console.log area
        removepotential: -> 
            @haspotentialmoves = false
            bitmaphit = @model.bitmap.hitArea
            bitmaphit.drawn = false
            bitmaphit.off "click"
            stage.removeChild bitmaphit
        events: ->
            "click": -> console.log "hitarea"
            mouseover: (e) ->
                if @potentialmove then @$el.addClass("selecting-move")
            mouseout: ->
                if @potentialmove then @$el.removeClass("selecting-move")

    _grid = new GridOverlay child: GridSquare

    getActive = (opts) ->
        _activebattle.get("AllCharacters").getActive(opts)

    clearPotentialMoves = ->
        if !_potential_moves? then return @
        _.each _potential_moves.models, (tile) ->
            tile.trigger "removemove"
        @

    _b = window.battler = {
        getActive: (opts) ->
            getActive opts
        toggleGrid: ->
            console.log "calling toggle grid from"
            console.log arguments.callee.caller.name
            _activemap = mapcreator.getChunk()
            _grid.toggle()
        activateGrid: ->
            console.log "calling toggle grid from"
            console.log arguments.callee.caller.name
            _activemap = mapcreator.getChunk()
            _grid.activate()
        deactivateGrid: ->
            _grid.deactivate()
        getActiveMap: -> 
            _activemap
        getQueue: ->
            _activebattle.get("AllCharacters")
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
        startTimer: (extra, done) ->
            _timer.start extra, done
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
        randomBattle: ->
            if _activebattle then _activebattle.destroy()
            _activebattle = b = new Battle()
            b.randomize()
        # Battle has substates of main board state
        setState: (state) ->
            _activebattle.setState state.toUpperCase()
            @
        # Adds a state to the array of states - string
        addState: (newstate) -> 
            _activebattle.addState newstate.toUpperCase()
            @
        # Give an string state to remove
        removeState: (removeme) ->
            removeme = removeme.toUpperCase()
            if _activebattle.hasState removeme then _activebattle.removeState removeme
            @
        toggleState: (state) ->
            if _activebattle.hasState(state) then _activebattle.removeState state
            else _activebattle.addState state
        setPotentialMoves: (moves) ->
            _potential_moves = moves
        clearPotentialMoves: ->
            clearPotentialMoves()
    }   


    window.t = ->
      b = _b.getActive()
      b.trigger "turndone"
      return b

    _b