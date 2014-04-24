define ["board", "globals", "utilities", "taskrunner", "mapper", "npc", "mapcreator", "player", "cast", "items"], (board, globals, ut, taskrunner, mapper, NPC, mapcreator, player, cast, items) ->

    window.t = ->
        getQueue().next()

    Player = player.model
    NPCArray = NPC.NPCArray
    Enemy = NPC.Enemy
    stage = board.getStage()
    map = globals.map
    # Standard modifier (d20)
    _sm = 20
    _ts = globals.map.tileside
    states = ['choosingmoves', 'choosingattacks', 'menuopen']
    battle_events = _.extend {}, Backbone.Events
    _activebattle = null
    _shared = globals.shared_events
    _activemap = null
    _ts = globals.map.tileside

    # Handler for battle state functions. Respnsible for battle state (a subset of board state)
    class Battle extends Backbone.Model
        states: []
        defaults: ->
            InitQueue = new InitiativeQueue()
            PCs = InitQueue.PCs = taskrunner.getParty()
            return {
                NPCs: new NPCArray
                InitQueue: InitQueue
                avglevel: PCs.getAverageLevel()
                numenemies: 1#Math.ceil(Math.random() * PCs.length * 2 + 1)
                enemyBounds: {
                    min_x: 0
                    max_x: map.c_width
                    min_y: 0
                    max_y: map.c_height
                }
            }
        initialize:  ->
            @PC = PC = taskrunner.getPC()
            @dispatcher = new Dispatcher(PC.marker.x, PC.marker.y)
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
        removeTravelPC: -> 
            stage.removeChild @PC.marker
            @PC.leaveSquare()
            @PC.setPos 0, 0
        begin: (type, opts) ->
            @removeTravelPC()
            @dispatcher.show().showDispatchMenu()
            @grid.activate()
            if type is "random" then @randomize(opts)
            else @load type, opts
        load: (id) ->
            @url = @id || globals.battle_dir + id
            @fetch success: (battle) ->
                console.log battle
        # A function for creating a random battle, within parameters (or NOT?!!)
        randomize: (o={}) ->
            o = _.extend @defaults(), o
            names = ["Steve", "John", "Ken", "Tom", "Bob", "Zeke", "Dan"]
            for i in [0...o.numenemies]
                @get("NPCs").add(n = new Enemy({name: names[i]}, {parse: true}))
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
                tile.removePotentialMovePath()
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
            if NPCArr.length is 0
                alert "you won!"
            else if PCArr.length is 0 
                alert "they won :/"
        virtualMovePossibilities: ->
            @grid.virtualMovePossibilities.apply(@grid, arguments)
        pulseGrid: -> @grid.model.trigger "pulse"
        activateGrid: -> @grid.activate()
        deactivateGrid: -> @grid.deactivate()
        toggleGrid: -> @grid.toggle()

    # To begin each battle, players are dispatched from a central point. 
    # This class contains the controls for that central point
    class Dispatcher
        visible: false
        constructor: (x = 100, y = 500) ->
            spritesheet = {
                framerate: 100
                animations: 
                    pulse: [0,7]
                frames: [
                    [0,0,50,57],
                    [50,0,50,57],
                    [100,0,50,57],
                    [150,0,50,57],
                    [150,0,50,57],
                    [100,0,50,57],
                    [50,0,50,57],
                    [0,0,50,57]
                ]
            }
            base = new createjs.SpriteSheet(_.extend spritesheet, {images: ["images/tiles/dispatchbase.png"]})
            base.getAnimation("pulse").speed = .25
            base.getAnimation("pulse").next = "pulse"
            @marker = new createjs.Container()
            @marker.addChild base = new createjs.Sprite(base, "pulse")
            base.y = 20
            @marker.x = x
            @marker.y = y
            target = mapper.getTargetTile 0, 0, {x:x,y:y}
            target.tileModel.set("npc", false)
            @currentspace = target
            @marker.regY = 7
            @bindEvents()
            @
        showDispatchMenu: ->
            battle_events.trigger "showDispatchMenu", taskrunner.getParty()
            @
        bindEvents: ->
            @marker.on "click", @showDispatchMenu, false, @
            @
        show: ->
            @visible = true
            stage.addChild @marker
            @
        hide: ->
            @visible = false
            stage.removeChild @marker
            @
        addChild: (marker) -> @marker.addChild marker
        removeChild: (id) -> @marker.removeChild id
        getX: -> @marker.x
        getY: -> @marker.y
        # If there is a PC already on the pad, cannot dispatch
        canDispatch: -> !@currentspace.tileModel.isOccupied()

    # Simple circular queue. Handes the battle progression
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
                "die": (model) -> 
                    alert "#{model.get('name')} died!"
                    _activebattle.checkEndOfBattle()
            _.each models, (character) => character.trigger("add", character, @, {})
        model: (attrs, options) ->
            switch attrs.type
              when 'player' then m = new player.model attrs, options
              when 'npc' then m = new NPC.NPC attrs, options
              when 'enemy' then m = new Enemy attrs, options
            m.queue = @
            m
        comparator: (model) -> 
            if model.i then return model.i
            else 
                model.i = model.get("init") + Math.ceil(Math.random()*_sm)
            model.i
        # comparator: (model) -> -model.get("type") is "PC"
        # returns the pc or npc at the top of the queue
        getActive: (opts) -> 
            opts = _.extend {player: false}, opts
            active = @at @current_index
            if opts.player is true and active.isPC() is false then return null
            else return active
        # Advance the queue and start the new character's turn by default. 
        # Pass in false to prevent this.
        next: (init) -> 
            num = @current_index = ++@current_index % @length
            active_player = @getActive()
            # Look for live player
            while active_player.isDead()
                active_player = @getActive()
            _activebattle.clearAllHighlights()
            if active_player.isPC() and @PCs.anyDispatched() is false
                events.trigger "showDispatchMenu"
            else
                unless init is false
                    setTimeout -> 
                        active_player.initTurn()
                    , @turnDelay
            num
        # Shifts the queue back by one!
        prev: -> 
            @current_index--
            if @current_index < 0 then @current_index = @length - 1

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
        initialize: ({@battle, @child, @model})->
        modifyAllTiles: ->
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
        # Like move, but lightweight and with no transitions - simple arithmetic check
        # Because we're not updating marker, we can pass in a start object (x:,y:) to be virtualized from
        virtualMove: (dx, dy, start, opts) ->
            opts || opts = {}
            if board.isPaused() then return false
            target = mapper.getTargetTile dx, dy, start
            if _.isEmpty(target) 
                return false
            if target.tileModel.discovered 
                return false
            if !target.tileModel.checkEnterable(dx, dy, start, opts) 
                return false
            target
        # Runs through the currently visible tiles in a battle and determines which moves are possible
        # Returns array of tiles. If true, silent prevents observation 
        # Still inefficient - keeps checking past max distance - todo
        virtualMovePossibilities: (start, done, opts) ->
            done       || (done = (target) -> target.tileModel.trigger("potentialmove"))
            if start is "dispatch" then start = mapper.getTargetTile(0,0, @battle.dispatcher.marker)
            path_defaults = 
                # Compute diagonals as a distance-1 move?
                diagonal: false
                # Do not designate squares occupied by NPCs as un-enterable
                ignoreNPCs: false
                # Do not designate squares occupied by PCs as un-enterable
                ignorePCs: false
                # Only designate occupied squares as valid.
                ignoreEmpty: false
                # Should difficult terrain factor into distance?
                ignoreDifficult: false
                # Should the path be stored?
                storePath: true
                # Should the acceptable directions of a square
                ignoreDeltas: false
                # How long should we search for?
                range: 6
                # The context to call the handler in
                handlerContext: @
            opts = _.extend path_defaults, opts
            checkQueue = []
            movable = new mapper.Row
            checkQueue.unshift(start)
            start.tileModel.discovered = true
            start.tileModel.distance = 0
            start.tileModel.pathFromStart.start = _.pick start, "x", "y"
            # Enqueue a target node and store the directions it took to get there
            enqueue = (dx, dy, previous, target) ->
                if target is false then return
                distance = previous.distance
                unless opts.storePath is false
                    path = ut.deep_clone previous.pathFromStart.path
                    path.push {dx: dx, dy: dy}
                    pathFromStart = target.tileModel.pathFromStart
                    pathFromStart.path = path
                    pathFromStart.start = previous.pathFromStart.start
                if !target then return
                d = if target.m then target.m else 1
                if opts.ignoreDifficult then d = 1
                if distance + d > opts.range then return
                else target.tileModel.distance = distance + d
                target.tileModel.discovered = true
                checkQueue.unshift target
                done.call(opts.handlerContext, target)
            until checkQueue.length <= 0
                square = checkQueue.pop()
                tile = square.tileModel
                movable.push tile
                for i in [-1..1]
                    if i is 0 then continue
                    enqueue(0, i, square.tileModel, @virtualMove 0, i, square, opts)
                    enqueue(i, 0, square.tileModel, @virtualMove i, 0, square, opts)
                    if opts.diagonal is true
                        enqueue(i, i, square.tileModel, @virtualMove i, i, square, opts)
                        enqueue(-i, i, square.tileModel, @virtualMove -i, i, square, opts)
            # Remove the original square from the results
            # movable.shift()
            _.each movable.models, (tile) ->
                tile.discovered = false
            movable

    class GridSquare extends Backbone.View
        tagName: 'li'
        template: "&nbsp;"
        colors: {
            selected_move: "green"
            potential_move: "#ea0000"
            general: 'blue'
            burst: 'orange'
        }
        pulsing: true
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
                rangeattack: @attackrange
                burstattack: @burstattack
            @listenTo @model.collection.chunk, 
                pulse: @pulse
                stopPulsing: @stopPulsing
            @setUpHitArea()
        stopPulsing: ->
            @pulsing = false
            @model.bitmap.hitArea.alpha = .3
            @
        pulse: ->
            direction = 1
            @pulsing = true
            area = @model.bitmap.hitArea
            # setInterval =>
            #     unless @pulsing is false or area.drawn is false
            #         area.alpha += .01 * direction
            #         if area.alpha >= .4
            #             direction = -1
            #         else if area.alpha <= .16
            #             direction = 1
            # , 50
            @
        setUpHitArea: ->
            bitmap = @model.bitmap
            area = bitmap.hitArea
            area.drawn = false
            area.x = bitmap.x 
            area.y = bitmap.y
            area.alpha = .16
            @
        render: ->
            @model.square = @
            @$el.html(_.template @template, @model.toJSON())
            if @model.get("e") is "f" then @$el.addClass("nogrid")
            @
        drawHitAreaSquare: (color) ->
            @model.bitmap.hitArea.graphics.clear().beginFill(color).drawRect(0, 0, _ts, _ts).endFill();
         move_fns:
            # handler for click event on 
            clickHandler: (e, data) -> 
                if @moving is true then return @
                active_player = getActive()
                path = @model.pathFromStart.path
                # Stop the timer while moving - player not punished for animation
                _timer.stop()
                @moving = true
                moveInterval = =>
                    if _.isEmpty(path)
                        @stopListening active_player, "donemoving"
                        @moving = false
                        _activebattle.clearPotentialMoves()
                        # _activebattle.potential_moves = active.virtualMovePossibilities()
                        active_player.takeMove()
                    else
                        deltas = path.shift()
                        active_player.moveInterval(deltas.dx,deltas.dy)
                do moveInterval
                @listenTo active_player, "donemoving", -> setTimeout moveInterval, 100
            mouseoverHandler: (e, data) ->
                console.log "mouse"
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
                attacker = power.belongsTo()
                if data.type is "burst"
                    _.each _activebattle.attack_zone.getOccupied(
                        {reject: (subj) -> _.isEqual(subj.getOccupant(), attacker)}).models
                    , (square, i) =>
                        @handleAttack attacker, square.getOccupant(), power
                else subject = @model.getOccupant()
                if !subject? then return false
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
        handleAttack: (attacker, subject, power, opts={take_action: true}) ->
            if !attacker.can(power.get "action") then return @
            power.use.call(power, subject, {take_action: opts.take_action})
            # Some powers cost magic 
            _activebattle.clearAttackZone()
            @
        bindMoveFns: ->
            area = @model.bitmap.hitArea
            m = @move_fns
            area.on "click" , m.clickHandler, @, false, area: area
            area.on "mouseover", m.mouseoverHandler, @, false, area: area
            area.on "mouseout", m.mouseoutHandler, @, false, area: area
        bindAttackFns: (type) ->
            area = @model.bitmap.hitArea
            a = @attack_fns
            area.on "click" , a.clickHandler, @, false, area: area, type: type
            area.on "mouseover", a.mouseoverHandler, @, false, area: area, type: type
            area.on "mouseout", a.mouseoutHandler, @, false, area: area, type: type
        highlight: ->
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
            area = @model.bitmap.hitArea
            @unbindHitFns()
            area.drawn = false
            area.alpha = 0
            # stage.removeChild bitmaphit
        attackrange: ->
            area = @model.bitmap.hitArea
            @drawHitAreaSquare @colors.general
            area.alpha = 0.3
            area.drawn = true
            @bindAttackFns()
            stage.addChildAt(area, 0)
            @
        burstattack: ->
            area = @model.bitmap.hitArea
            @drawHitAreaSquare @colors.burst
            area.alpha = 0.3
            area.drawn = true
            @bindAttackFns "burst"
            stage.addChildAt(area, 0)
        events: ->
            "click": -> console.log "hitarea"
            mouseover: (e) ->
                if @potentialmove then @$el.addClass("selecting-move")
            mouseout: ->
                if @potentialmove then @$el.removeClass("selecting-move")

    getActive = (opts) ->
        _activebattle.get("InitQueue").getActive(opts)

    virtualMovePossibilities = ->
        _activebattle.virtualMovePossibilities.apply(_activebattle, arguments)

    setPotentialMoves = (squares) ->  _activebattle.potential_moves = squares

    discardDispatch = ->
        dispatcher = _activebattle.dispatcher
        if dispatcher.canDispatch()
            if dispatcher.potential_dispatch
                dispatcher.marker.removeChildAt 1
                dispatcher.potential_dispatch = null
            _activebattle.clearAllHighlights()

    getQueue = -> _activebattle.get("InitQueue")

    _shared.on "battle", ->
        if _activebattle then _activebattle.destructor().destroy()
        _activebattle = new Battle()
        grid = new GridOverlay model: _activemap, child: GridSquare, battle: _activebattle
        _activebattle.grid = grid
        _activebattle.begin "random"

    # Expose
    window.battler = {
        # Returns the currently active player
        getActive: (opts) -> getActive opts
        # Returns only players. Even dead ones.
        getPlayers: -> taskrunner.getParty()
        getNPCs: -> _activebattle.get("NPCs")

        toggleGrid: ->
            _activemap = mapcreator.getChunk()
            if _activebattle
                _activebattle.toggleGrid()
        activateGrid: ->
            _activemap = mapcreator.getChunk()
            if _activebattle
                _activebattle.activateGrid()
        deactivateGrid: ->
            if _activebattle
                _activebattle.deactivateGrid()
        getActiveMap: -> 
            _activemap
        # Gets all characters, dead or alive.
        getQueue: -> getQueue()
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
            if _activebattle
                _activebattle.setState state.toUpperCase()
            @
        # Adds a state to the array of states - string
        addState: (newstate) -> 
            if _activebattle
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
        setPotentialMoves: (squares) -> setPotentialMoves squares
        setAttacks: (squares) ->
            _activebattle.attack_zone = squares
        clearPotentialMoves: ->
            if _activebattle
                _activebattle.clearPotentialMoves()
        removeHighlighting: ->
            if _activebattle
                _activebattle.clearAllHighlights()
        startPulsing: ->
            if _activebattle
                _activebattle.pulseGrid()
        virtualMovePossibilities: -> virtualMovePossibilities.apply(@, arguments)
        # Expects a PC model, and places it softly on the dispatcher (only appears there)
        potentialDispatch: (character) ->
            dispatcher = _activebattle.dispatcher
            if dispatcher.canDispatch()
                dispatcher.marker.addChildAt character.marker, 1
                dispatcher.potential_dispatch = character
                setPotentialMoves virtualMovePossibilities "dispatch", null, {range: character.get("spd")}
        # Remove the softly placed PC
        discardDispatch: ->
            discardDispatch()
            @
        # Add the PC to the battle at the dispatcher's square
        confirmDispatch: ->
            dispatcher = _activebattle.dispatcher
            if dispatcher.canDispatch()
                ut.destroyModal()
                character = dispatcher.potential_dispatch 
                if character 
                    discardDispatch()
                    board.addMarker character
                    queue = getQueue()
                    queue.add character, {at: queue.current_index}
                    character.dispatch(dispatcher)
                    queue.prev()
                    queue.next()

            @

        events: battle_events
    }   