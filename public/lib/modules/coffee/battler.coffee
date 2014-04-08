define ["board", "globals", "utilities", "mapper", "npc", "mapcreator", "player", "backbone", "underscore", "jquery"], (board, globals, ut, mapper, NPC, mapcreator, player) ->

    PCs = player.PCs
    Player = player.model
    NPCArray = NPC.NPCArray
    Enemy = NPC.Enemy
    NPC = NPC.NPC
    stage = board.getStage()
    map = globals.map
    # Standard modifier (d20)
    _sm = 20
    _ts = globals.map.tileside
    states = ['choosingmoves', 'choosingattacks', 'menuopen']

    # Simple circular queue
    class InitiativeQueue extends NPCArray
        current_index: 0
        type: 'InitiativeQueue'
        # How long to wait in between turns? MS
        turnDelay: 300
        initialize: (models) ->
            _.bindAll @, "next", "prev", "getActive"
            # When a player/npc says theire turn is done, advance the queue
            @on 
                "turndone": ->
                    board.mainCursor().hide()
                    @next()
                "die": (model) => 
                    console.log "#{model.get('name')} died (in InitiativeQueue listener)"
                    @remove model
                    _activebattle.checkEndOfBattle()
            _.each models, (character) => character.trigger("add", character, @, {})
        model: (attrs, options) ->
            switch attrs.type
              when 'player' then m = new player.model attrs, options
              when 'npc' then m = new NPC attrs, options
              when 'enemy' then m = new Enemy attrs, options
            # Deflects against multiple collections
            m.queue = @
            m
        # comparator: (model) -> model.i = model.get("init") + Math.ceil(Math.random()*_sm)
        comparator: (model) -> -model.get("type") is "PC"
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
            active_player = @getActive()
            _activebattle.clearAllHighlights()
            unless init is false
                setTimeout -> 
                    active_player.initTurn()
                , @turnDelay

            num
        # Shifts the queue back by one!
        prev: -> 
            @current_index--
            if @current_index < 0 then @current_index = @length - 1



    class Battle extends Backbone.Model
        states: []
        defaults: 
            NPCs: new NPCArray
            InitQueue: new InitiativeQueue(PCs.models)
            avglevel: PCs.getAverageLevel()
            numenemies: 5#Math.ceil(Math.random() * PCs.length * 2 + 1)
            enemyBounds: {
                min_x: 0
                max_x: map.c_width
                min_y: 0
                max_y: map.c_height
            }
        initialize: ->
            @listenTo @get("NPCs"), 
                die: @checkStillLiving
            @on 
                "choosingmoves"  : -> @clearAttackZone()
                "choosingattacks": -> @clearPotentialMoves()


        addState: (newstate) ->
            if @hasState(newstate) is false
                @states.push newstate
        setState: (newstate) ->
            @trigger "newstate"
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
        checkStillLiving: (model, collection, options) ->
            if collection
                flag = true
                _.each collection.models, (character) =>
                    if character.dead is false then flag = false
                return flag
            false
        addPCs: ->
            _.each PCs.models, (pc, i) ->
                # unless i is 0
                pc.addToMap()
                globals.shared_events.trigger "bindmenu", pc
                board.addMarker pc
        begin: (type, opts)->
            @addPCs()
            if type is "random" then @randomize(opts)
            else @load type, opts

        load: (id) ->
            @url = @id || globals.battle_dir + id
            @fetch success: (battle) ->
                console.log battle
        # A function for creating a random battle, within parameters (or NOT?!!)
        randomize: (o={}) ->
            o = _.extend @defaults, o
            for i in [0...o.numenemies]
                console.log "in loop"
                @get("NPCs").add(n = new Enemy level: o.avglevel)
                @get("InitQueue").add n
                n.addToMap()
                globals.shared_events.trigger "bindmenu", n
            @get("InitQueue").sort()
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
            @
        clearPotentialMoves: ->
            if !@potential_moves? then return @
            _.each @potential_moves.models, (tile) ->
                tile.trigger "removemove"
            @
        clearAttackZone: ->
            if !@attack_zone? then return @
            _.each @attack_zone.models, (tile) ->
                tile.trigger "removeattackzone"
            @
        clearAllHighlights: ->
            @clearAttackZone()
            @clearPotentialMoves()

        # Checks if there is only one type of model left
        # If only PCs left, the PCs have won and vice versa
        checkEndOfBattle: (type) ->
            initiative = @get("InitQueue").models
            NPCArr = []
            PCArr = []
            _.each initiative, (character) ->
                if character instanceof Player then PCArr.push character
                else NPCArr.push character
            console.log NPCArr, PCArr
            if NPCArr.length is 0
                alert "you won!"
            else if PCArr.length is 0 
                alert "they won :/"



    _activebattle = new Battle
    _active_chars = PCs
    _shared = globals.shared_events
    _shared.on "battle", ->
        _activebattle.destructor().destroy()
        b = _activebattle = new Battle
        b.begin "random"
        _grid.activate()
    _activemap = null
    _ts = globals.map.tileside

    # Keeps track of timed events in the battle field
    # When done, triggers a shared event so other modules know
    class Timer
        constructor: (@el, @number) -> 
        interval: null
        totaltime: 25000
        stop: -> if @interval then clearInterval @interval
        start: (extra, done) ->
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
                removemove: ->
                    @unbindMoveFns()
                    @removehighlighting()
                removeattackzone:->
                    @removehighlighting()
                    @unbindAttackFns()
                generalhighlight: @highlight
                attackrange: @attackrange
            @setUpHitArea()
        setUpHitArea: ->
            # o = Math.ceil(@model.get("elv") / 5)
            # if o < -5 then o = -5 else if o > 5 then o = 5
            bitmap = @model.bitmap
            # bitmap.x += o
            # bitmap.y += o
            area = bitmap.hitArea
            area.x = bitmap.x 
            area.y = bitmap.y
            @
        render: ->
            @model.square = @
            @$el.html(_.template @template, @model.toJSON())
            @
        drawHitAreaSquare: (color) ->
            @model.bitmap.hitArea.graphics.clear().beginFill(color).drawRect(0, 0, _ts, _ts).endFill();
         move_fns:
            # handler for click event on 
            clickHandler: (e, data) -> 
                active = getActive()
                path = @model.pathFromStart.path
                # Stop the timer while moving - player not punished for animation
                _timer.stop()
                moveInterval = =>
                    if _.isEmpty(path)
                        @stopListening active, "donemoving"
                        _activebattle.clearPotentialMoves()
                        # _activebattle.potential_moves = active.virtualMovePossibilities()
                        active.takeMove()
                    else
                        deltas = path.shift()
                        active.moveInterval(deltas.dx,deltas.dy)
                do moveInterval
                @listenTo active, "donemoving", -> setTimeout moveInterval, 100
            mouseoverHandler: (e, data) ->
                board.mainCursor().show().move @model.bitmap
                @drawHitAreaSquare @colors.selected_move
                @
            mouseoutHandler: (e, data) ->
                board.mainCursor().hide()
                @drawHitAreaSquare @colors.potential_move
                @
        attack_fns: 
            clickHandler: (e, data) -> 
                power = @model.boundPower
                attacker = power.ownedBy
                subject = @model.bitmap.occupiedBy
                if !subject? then return "Trying to attack an empty square"
                else @handleAttack(attacker, subject, power)

            mouseoverHandler: (e, data) ->
                @drawHitAreaSquare @colors.selected_move
                board.mainCursor().show().move @model.bitmap
                if @model.isOccupied()
                    @model.getOccupant().menu.showAttributeOverlay()
            mouseoutHandler: (e, data) ->
                @drawHitAreaSquare @colors.general
                board.mainCursor().hide()
                if @model.isOccupied()
                    @model.getOccupant().menu.hideAttributeOverlay()
        # Accepts an attacker NPC object (or subclass), 
        # NPC subject of the attack, and the power being used
        # Calls the power's use function and performing the default actions
        handleAttack: (attacker, subject, power) ->
            attrs = power.toJSON()
            if !attacker.can(attrs.action) then return @
            use = attrs.use
            if _.isFunction(use) then use.call(power, subject, attacker)
            subject.takeDamage(attrs.damage + ut.roll(attrs.modifier))
            # Some powers cost magic 
            attacker.useCreatine(attrs.creatine)
            attacker.takeAction(attrs.action)
            power.use()
            _activebattle.clearAttackZone()
            @
        bindMoveFns: ->
            area = @model.bitmap.hitArea
            m = @move_fns
            area.on "click" , m.clickHandler, @, false, area: area
            area.on "mouseover", m.mouseoverHandler, @, false, area: area
            area.on "mouseout", m.mouseoutHandler, @, false, area: area
        bindAttackFns: ->
            area = @model.bitmap.hitArea
            a = @attack_fns
            area.on "click" , a.clickHandler, @, false, area: area
            area.on "mouseover", a.mouseoverHandler, @, false, area: area
            area.on "mouseout", a.mouseoutHandler, @, false, area: area
        highlight: ->
            console.log "highlighting"
            console.log arguments
            bitmap = @model.bitmap
            area = bitmap.hitArea
            g = area.graphics

        # Pass in a stringto identify why a grid square should be highlighted
        potentialmoves: ->
            # @haspotentialmoves = true
            area = @model.bitmap.hitArea
            @drawHitAreaSquare @colors.potential_move
            area.alpha = 0.3
            area.drawn = true
            @bindMoveFns(area)
            stage.addChildAt(area, 0)
            @
        unbindMoveFns: ->
        unbindAttackFns: ->
        unbindHitFns: ->
            @model.bitmap.hitArea.removeAllEventListeners()
        removehighlighting: -> 
            # @haspotentialmoves = false
            bitmaphit = @model.bitmap.hitArea
            @unbindHitFns()
            bitmaphit.drawn = false
            bitmaphit.alpha = 0
            # stage.removeChild bitmaphit
        attackrange: ->
            console.log "attack range at" + @model.x, @model.y 
            area = @model.bitmap.hitArea
            @drawHitAreaSquare @colors.general
            area.alpha = 0.3
            area.drawn = true
            @bindAttackFns()
            stage.addChildAt(area, 0)
            @
        events: ->
            "click": -> console.log "hitarea"
            mouseover: (e) ->
                if @potentialmove then @$el.addClass("selecting-move")
            mouseout: ->
                if @potentialmove then @$el.removeClass("selecting-move")

    _grid = new GridOverlay child: GridSquare

    getActive = (opts) ->
        _activebattle.get("InitQueue").getActive(opts)


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
            _activebattle.get("InitQueue")
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
        start: ->
            a = getActive().initTurn()
            setTimeout @stopTimer(), 1000
        stop: ->

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
        setPotentialMoves: (squares) ->
            _activebattle.potential_moves = squares
        setAttacks: (squares) ->
            _activebattle.attack_zone = squares
        clearPotentialMoves: ->
            _activebattle.clearPotentialMoves()
        removeHighlighting: ->
            _activebattle.clearAllHighlights()
    }   


    window.t = ->
      _activebattle.get("InitQueue").getActive().endTurn()
    _b