define ["powers", "globals", "utilities", "dialog", "battler","board", "underscore", "backbone", "jquery-ui"], (powers, globals, ut, dialog, battler, board) ->

    board.focus()

    _menus = []
    $wrapper = $(".wrapper")

    _activemenu = battler.getActive().menu
    # Close all menus
    globals.shared_events.on "closemenus", ->
        closeAll()

    globals.shared_events.on "openmenu", ->
        _activemenu.open()

    globals.shared_events.on "bindmenu", (character) ->
        _activemenu = character.menu = new Menu model: character
        _menus.push _activemenu


    InventoryList = items.InventoryList

    class PowerList extends Backbone.View
        tagName: 'ul'
        initialize: ->
            _.bindAll @, "append"
        render: ->
            @$el.empty()
            _.each @collection.models, @append
            @
        append: (power) ->
            power = new PowerListItem model: power
            @$el.append(power.render().el)


    class PowerListItem extends Backbone.View
        tagName: 'li'
        className: 'power-item'
        template: $("#power-item").html()
        initialize: ->
            _.bindAll @, "rangeHandler"
            @listenTo @model,
                "change:uses": @renderUses
        render: ->
            @$el.html(_.template(@template, @model.toJSON()))
            @
        renderUses: (model, uses) ->
            console.log uses
            @$(".uses").text(uses)
        rangeHandler: (target)->
            target.tileModel.boundPower = @model
            target.tileModel.trigger "attackrange"
        events: 
            "click": ->
                user = @model.ownedBy
                if !user then return 
                opts = {diagonal: true, ignoreNPCs: true, storePath: false, ignoreDifficult: true, ignoreDeltas: true}
                battler.setAttacks u = user.virtualMovePossibilities(null, @rangeHandler, 1, opts)
                battler.setState("choosingattacks")

    _potential_moves = null

    class Meter extends Backbone.View
        tagName: 'meter'
        initialize: (attrs) ->
            attr = attrs.model.get(@className)
            @name = attrs.model.get("name")
            @setMin 0
            @setMax attr
            @setOptimal attr/2
            @listenTo @model, "change:" + @className, (model, m) => @set m
            @render()
        set: (value) ->  @$el.attr("value", value); @
        setMin: (min) -> @$el.attr("min", min); @
        setMax: (max) -> @$el.attr("max", max); @
        setOptimal: (optimal) -> @$el.attr("optimal", optimal); @
        hide: ->
            @visible = false
            @$el.fadeOut "fast"
            @
        show: -> 
            @visible = true
            @$el.fadeIn "fast"
            @
        isVisible: -> @visible
        render: -> 
            attr = @model.get(@className)
            @$el.attr("display", "#{@className}: #{attr}")
            @set attr
            @
        events: 
            click: -> console.log @model


    # Basic manu view
    class Menu extends Backbone.View
        type: 'default'
        className: 'game-menu'
        template: $("#menu").html()
        type: 'battle'
        initialize: ->
            @listenTo @model, 
                "beginphase": (phase) -> @$(".phase-number").text(phase + 1)
            _.bindAll @, "close", "open", "toggle", "selectNext", "selectThis", "selectPrev"
            @close()
            @setupMeters()
            @render()
            @renderAttributeOverlays()
            @$el.appendTo $wrapper
        render: (quadrant = @model.getQuadrant()) ->
            @$el.html(_.template @template, _.extend(@model.toJSON(),{phase: @model.turnPhase}))
            if quadrant then @$el.attr("quadrant", quadrant)
            @showPowers()
            @showInventory()
        setupMeters: ->
            @meters = {}
            h = @meters.health = new Meter className: 'HP', model: @model
            h.$el.appendTo $wrapper
            c = @meters.creatine = new Meter className: 'creatine', model: @model
            c.$el.appendTo $wrapper
            @
        showInventory: ->
            list = InventoryList collection: @model.get "inventory"
            @$(".inventory-list").html(list.render().el)
            @
        showPowers: ->
            list = new PowerList collection: @model.get "powers"
            @$(".power-list").html(list.render().el)
            @
        selectThis: ($item) ->
            $item.addClass("selected").
            siblings(".selected").removeClass("selected")
            @
        selectNext: ->
            @selectThis @$el.children(".selected").next()
        selectPrev: ->
            console.log "prev"
            @selectThis @$el.children(".selected").prev()
        events:
            "click": ->
                console.log @model.get "name"
            "click .js-close-menu": ->
                toggleMenu @type
            "click .js-show-inventory": (e) ->
                @showInventory()
                e.stopPropagation()
            "click li": (e) ->
                @selectThis $(e.currentTarget)
            "keyup": (e) ->
                key = e.keyCode || e.which
                switch key
                    when 38 then @selectPrev()
                    when 40 then @selectNext()
                    when 32 then @toggle()
                    when 27 then @close()
                    when 13 then @$el.children(".selected").trigger "click"
            "click .js-virtual-move": -> 
                battler.clearPotentialMoves()
                _potential_moves = battler.getActive().virtualMovePossibilities()                
                battler.setPotentialMoves _potential_moves
                battler.setState("choosingmoves")
            # "click": -> board.$canvas.focus()
        clickActiveItem: ->
            @$el.children(".selected").trigger "click"
        close: ->
            _activemenu = null
            @showing = false
            @$el.effect "slide", _.extend({mode: 'hide'}, {direction: 'right', easing: 'easeInOutQuart'}), 300
            board.unpause().focus()
            battler.removeHighlighting()
            _.each @meters, (meter) -> meter.hide()
        open: ->
            active_player = battler.getActive()
            battler.setState("menuopen")
            quadrant = @model.getQuadrant()
            _activemenu = @
            @showing = true 
            dir = if quadrant is 1 then "left" else "right"
            $(".game-menu").hide()
            $("meter").hide()
            @render(quadrant)
            @renderAttributeOverlays true
            @$el.focus().select().effect "slide", _.extend({mode: 'show'}, {direction: dir, easing: 'easeInOutQuart'}) , 300
        toggle: ->
            if @showing then @close()
            else @open()    
        renderAttributeOverlays: (show) ->
            _.each @meters, (meter) ->
                meter.render()
                if show is true
                    console.log meter.name
                    meter.show()

    toggleMenu = () ->
        _activemenu.toggle()
        board.toggleState("MENUOPEN")

    closeAll = ->
        _.each _menus, (menu) -> 
            menu.close()
        board.removeState "MENUOPEN"

    window.menus = {    
        open: ->
            _activemenu.open()
            @
        close: ->
            _activemenu.close()
            @
        toggleMenu: (menu) -> 
            toggleMenu menu
            @
        selectNext: -> 
            _activemenu.selectNext()
            @
        selectPrev: -> 
            _activemenu.selectPrev()
            @
        activateMenuItem: -> 
            _activemenu.clickActiveItem()
            @
        closeAll: -> 
            closeAll()
            @
        Menu: (construction) -> new Menu construction
        a: -> _menus
    }
