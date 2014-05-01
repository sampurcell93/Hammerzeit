define ['globals', 'utilities', 'jquery', 'underscore', 'easel'], (globals, ut) ->
    canvas = document.getElementById "game-board"
    $canvas = $ canvas
    # The current zoom value
    _zoom = 0
    # The current pixel width and height of a loaded map
    _mapwidth = globals.map.c_width
    _mapheight = globals.map.c_height
    _ts = globals.map.tileside

    # State enum
    states = globals.states

    window.stage = stage = new createjs.Stage canvas
    stage.enableMouseOver 200
    stage.enableDOMEvents true
    _ticker = createjs.Ticker
    _ticker.addEventListener "tick", (tick) ->
        try 
            stage.update() unless tick.paused
        catch 
            _ticker.setPaused true
            alert "hey you dun goofed with moves somehow"

    state = ["INTRO"]
    textshadow = globals.textshadow = new createjs.Shadow("#000000", 0,0,7)

    scenecount = 0
    scenelen = 6

    # stage.addChild _cursors = new createjs.Container

    class Cursor 
        # The cursor sprite doesn't begin exactly at 0
        visible: false
        constructor: ->
            spritesheet = {
                framerate: 30
                animations: 
                    bounce: [0,12]
                images: ["images/sprites/cursorsprite.png"]
                frames: [
                    [0,0,50,70],
                    [50,0,50,70],
                    [100,0,50,70],
                    [150,0,50,70],
                    [200,0,50,70],
                    [250,0,50,70],
                    [300,0,50,70],
                    [300,0,50,70]
                    [250,0,50,70],
                    [200,0,50,70],
                    [150,0,50,70],
                    [100,0,50,70],
                    [50,0,50,70],
                    [0,0,50,70]
                ]
            }
            sheet = new createjs.SpriteSheet(spritesheet)
            sheet.getAnimation("bounce").speed = .63
            sheet.getAnimation("bounce").next = "bounce"
            @marker = new createjs.Sprite(sheet, "bounce")
            @marker.x = 0 
            @marker.y = @offset
            @marker.regY = 7
            @
        show: ->
            @visible = true
            stage.addChild @marker
            @
        hide: ->
            @visible = false
            stage.removeChild @marker
            @
        isVisible: -> @visible
        # Either pass in a DisplayObject as the first parameter, or x,y pixel coords to move to
        # If a displayobject is passed, the cursor will be set to one square ABOVE it (as an indicator) and the second arg will be an offset
        move: (x, y, d) ->
            if _.isObject(x)
                y = x.y - _ts
                x = x.x
            @marker.x = x
            @marker.y = y
            if d
                debugger
            @

    _cursor = new Cursor

    setPresetBackground = (bg) ->
        $canvas.attr "bg", bg

    introSlider = (count) -> 
        if count == -1 then $canvas.attr "bg", "image-none"
        else $canvas.attr "bg", ("image-" + parseInt(((count || scenecount++)%scenelen)+1))

    startSlideshow = ->
        introSlider()
        globals.introScenery = setInterval ->
            unless scenecount == 7
                introSlider()
            else
                clearInterval globals.introScenery
                globals.introScenery = setInterval introSlider, 13400
        , 0

    initialize = ->
        startSlideshow()
        # Make title text
        title = new createjs.Text(globals.name + " v " + globals.version, "50px Arial", "#f9f9f9")
        _.extend title, { x: 140, y: 100, shadow: textshadow }
        # Make new game button
        newgame = new createjs.Text("New Game", "30px Arial", "#f9f9f9")
        _.extend newgame, {x: 140, y: 280, shadow: textshadow, cursor: 'pointer', mouseEnabled: true}
        newgame.addEventListener "click", -> globals.shared_events.trigger "game:new"
        # Make load game button
        loadgame = new createjs.Text("Load Game", "30px Arial", "#f9f9f9")
        _.extend loadgame, {x: 380, y: 280, shadow: textshadow, cursor: 'pointer'}
        ut.addEventListeners loadgame, {
            "click": -> globals.shared_events.trigger "game:load"
            "mouseover": ->
                loadgame.font = "bold 30px Arial"
            "mouseout": ->
                loadgame.font = "30px Arial"
        }
        # Make copyright
        copyright = new createjs.Text("Game copyright " + globals.author + " 2014", "14px Arial", "rgba(255,255,255,.5)")
        _.extend copyright, {x: 10, y: 680, shadow: textshadow}
        stage.addChild newgame, loadgame, title, copyright

    clear = ->
        stage.removeAllChildren()
        stage.clear()

    # When the state changes to battle, flash the screen old school!!
    flashStateChange = () ->
        rect = new createjs.Shape();
        rect.graphics.beginFill("#000").drawRect(0, 0, globals.map.width, globals.map.height);
        ct = 0
        flash = setInterval ->
            stage.addChild rect
            setTimeout ->
                stage.removeChild rect
            , 200
            if ct++ > 4 then clearInterval flash
        , 30

    # Could have used backbone events, but felt contrived, would need to modify data structures 
    # and would still have to trigger...
    stateChangeEvents = {
        add: {
            "BATTLE": =>
                ut.c "the state has changed to battle. get it son"
                flashStateChange()
            "LOADING": =>
        }
        remove: {
            "BATTLE": =>
                ut.c "Battle over..."
            "TRAVEL": =>
                ut.c "travel done"
            "LOADING": =>
        }
    }

    addState = (newstate) ->
        if hasState(newstate) is false
            state.push newstate
            globals.shared_events.trigger("state:#{newstate.toLowerCase()}")
            fn = stateChangeEvents.add[newstate]
            if fn? then fn()

    setState = (newstate) ->
        state = [newstate]
        globals.shared_events.trigger("state:#{newstate.toLowerCase()}")

    removeState = (removeme) ->
        if state.length > 1
            index = state.indexOf removeme
            state.splice(index, 1) unless index == -1
            fn = stateChangeEvents.remove[removeme]
            if fn? then fn()
        else throw new Error("The board currently has only one state - you can't remove it. Try adding another state first.")
        state

    hasState = (checkstate) ->
        checkstate = checkstate.toUpperCase()
        if $.isArray state then state.indexOf(checkstate) != -1
        else state == checkstate


    addMarker = (obj, at) ->
        if at then stage.addChildAt obj, at
        else
            stage.addChild obj.marker
        obj.stage = stage


    zoomOut = ->
        current = $canvas.css("background-size").split(" ")
        current = _.map current, (num) -> parseInt num
        if isNaN(current[0]) 
            current[0] = _mapwidth
            current[1] = _mapheight 
        if current[0] is 1000 or current[1] is 700 then return _zoom
        newstr = current[0] - globals.map.width + "px "
        newstr += current[1] - globals.map.height + "px"
        $canvas.css("background-size", newstr)
        _zoom -= 1

    zoomIn = ->
        current = $canvas.css("background-size").split(" ")
        current = _.map current, (num) -> parseInt num
        if current == "auto" or current[0] >= _mapwidth or current[1] >= _mapheight
            return _zoom
        newstr = current[0] + globals.map.width + "px "
        newstr += current[1] + globals.map.height + "px"
        $canvas.css("background-size", newstr)
        _zoom++

    blurBoard = ->
        shape = new createjs.Shape().set(
              x: 0
              y: 0
            )
        shape.graphics.beginFill("#ff0000").drawRect 0, 0, 50
        blurFilter = new createjs.BlurFilter(5, 5, 1)
        shape.filters = [blurFilter]
        bounds = blurFilter.getBounds()
        shape.cache bounds.x, bounds.y, globals.map.width + bounds.width, bounds.height + globals.map.height
        shape.name = "blurfilter"
        stage.addChild shape

    unblurBoard = ->
        stage.removeChild stage.getChildByName("blurfilter")


    board = {
        canvas: canvas
        $canvas: $canvas
        getTicker: -> _ticker
        ctx: canvas.getContext "2d"
        # Expects a css bg attribute value.
        setPresetBackground: (bg) ->
            setPresetBackground bg
            @
        # Returns an array of current state integers
        getState: -> state
        # Checks if the board has a state - expects an INT
        hasState: (checkstate) ->
            hasState checkstate
        getStage: -> stage
        # Sets up the board
        initialize: ->
            do initialize
            @
        ### All state getters and setters are case insensitive! ###
        # Removes all other states - expects string
        setState: (state) ->
            setState state.toUpperCase()
            @
        # Adds a state to the array of states - string
        addState: (newstate) -> 
            addState newstate.toUpperCase()
            @
        # Give an string state to remove
        removeState: (removeme) ->
            removeme = removeme.toUpperCase()
            if hasState removeme then removeState removeme
            @
        toggleState: (state) ->
            if hasState(state) then removeState state
            else addState state
        clear: ->
            clear()
            @
        # Expects either a PC or NPC model - see player.coffee and npc.coffee
        addMarker: (character, at) ->
            addMarker character, at
        setBackgroundPosition: (position) ->
            if !position then return @
            $canvas.css("background-position", position)
            @
        setBackground: (url) ->
            console.log "failing bg", url
            if !url then return @
            console.log "setting bg to #{url}"
            $canvas.css("background-image", "url(" + url + ")")
            @
        getZoom: -> _zoom
        zoomIn: ->
            zoomIn()
        zoomOut: ->
            zoomOut()
        pause: (opts) ->
            opts = _.extend {}, opts
            if opts.blur then blurBoard()
            _ticker.setPaused true
            @
        unpause: ->
            unblurBoard()
            _ticker.setPaused false
            @
        isPaused: ->
            _ticker.getPaused()
        # Board defaults to 50ms between ticks
        slowTo: (interval) ->
            _ticker.setInterval interval
            @
        blur: (amount) -> 
            blurBoard()
            @
        unblur: -> 
            unblurBoard() 
            @
        focus: -> 
            $canvas.focus()
            @
        # Get a new cursor object
        newCursor: ->
            new Cursor
        # Use as general purpose cursor to avoid over instantiation
        mainCursor: -> _cursor

    }

    board.initialize()

    window.board = board