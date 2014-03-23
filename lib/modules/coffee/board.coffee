define ['globals', 'utilities', 'jquery', 'underscore', 'easel'], (globals, ut) ->
    canvas = document.getElementById "game-board"
    $canvas = $ canvas

    # State enum
    states = globals.states

    stage = new createjs.Stage canvas
    stage.enableMouseOver 1000
    ticker = createjs.Ticker
    ticker.addEventListener "tick", (tick) ->
        stage.update() unless tick.paused
    state = ["INTRO"]
    taskrunner = null
    textshadow = globals.textshadow = new createjs.Shadow("#000000", 0,0,7)

    scenecount = 0
    scenelen = 6

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

    # Draws the pc walking along the bottom of the screen
    walkingMan = () ->
        sheet = new createjs.SpriteSheet
            framerate: 30
            frames:[
                [0, 165, 55, 55, 0]
                [55, 165, 55, 55, 0]
                [110, 165, 55, 55, 0]
                [165, 165, 55, 55, 0]
            ]
            animations: 
                run: [0,3]
            images: ["images/sprites/hero.png"]
        sheet.getAnimation("run").speed = .13
        sheet.getAnimation("run").next = "run"
        sprite = new createjs.Sprite(sheet, "run")
        sprite.x = 0
        sprite.y = 0
        # sprite.addEventListener("tick", -> 
            # sprite.x += 3; 
            # if sprite.x >= 150 then sprite.x = -74)
        sprite.scaleY = sprite.scaleX = 1
        stage.addChild(sprite);

    initialize = (runner) ->
        taskrunner = runner
        startSlideshow()
        # Make title text
        title = new createjs.Text(globals.name + " v " + globals.version, "50px Arial", "#f9f9f9")
        _.extend title, { x: 140, y: 100, shadow: textshadow }
        # Make new game button
        newgame = new createjs.Text("New Game", "30px Arial", "#f9f9f9")
        _.extend newgame, {x: 140, y: 280, shadow: textshadow, cursor: 'pointer', mouseEnabled: true}
        newgame.addEventListener "click", ->
            taskrunner.newGame()

        # Make load game button
        loadgame = new createjs.Text("Load Game", "30px Arial", "#f9f9f9")
        _.extend loadgame, {x: 380, y: 280, shadow: textshadow, cursor: 'pointer', mouseEnabled: true}
        ut.addEventListeners loadgame, {
            "click": ->
                ut.c "load, you say?"
            "mouseover": ->
                loadgame.font = "bold 30px Arial"
            "mouseout": ->
                loadgame.font = "30px Arial"
        }
        # Make copyright
        copyright = new createjs.Text("Game copyright " + globals.author + " 2014", "14px Arial", "rgba(255,255,255,.5)")
        _.extend copyright, {x: 10, y: 680, shadow: textshadow}
        stage.addChild newgame, loadgame, title, copyright
        walkingMan()

    clear = ->
        stage.removeAllChildren()
        stage.clear()

    addState = (newstate) ->
        state.push newstate

    setState = (newstate) ->
        state = [newstate]

    removeState = (removeme) ->
        if $.isArray(state) and state.length > 1
            index = state.indexOf removeme
            state.splice(index, 1) unless index == -1
        else throw new Error("The board currently has only one state - you can't remove it.")
        state

    addCharacter = (character) ->
        stage.addChild character.marker
        character.stage = stage

    moveObjectTo = (item, x, y, options) ->
        ut.c item, x, y, options

    board = {
        canvas: canvas
        $canvas: $canvas
        ctx: canvas.getContext "2d"
        # Expects a css bg attribute value.
        setPresetBackground: (bg) ->
            setPresetBackground bg
            @
        getState: -> state
        # Checks if the board has a state - expects an INT
        hasState: (checkstate) ->
            if $.isArray state then state.indexOf(checkstate) != -1
            else state == checkstate

        getStage: -> stage
        # Takes in the taskrunner codependency
        initialize: (runner) ->
            initialize runner
            @
        # Removes all other states - expects string
        setState: (state) ->
            setState state
        # Adds a state to the array of states - string
        addState: (newstate) -> 
            addState newstate
            @
        # Give an integer to remove (IE 1 removes the "wait" state)
        removeState: (removeme) ->
            removeState removeme
            @
        clear: ->
            clear()
            @
        # Expects either a PC or NPC model - see player.coffee and npc.coffee
        addCharacter: (character) ->
            addCharacter character
        # Expects a stage item, an x coordinate to move it to, and a y coordinate. Optional options object last argument
        moveObjectTo: (item, x, y, options) ->
            moveObjectTo item, x, y, options
    }