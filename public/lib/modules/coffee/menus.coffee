define ["powers", "globals", "utilities", "dialog", "battler","board", "underscore", "backbone", "jquery-ui"], (powers, globals, ut, dialog, battler, board) ->

    board.focus()

    _menus = []
    _menu_slots = {top: null, bottom: null}
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
            _.bindAll @, "rangeHandler", "chooseTargets"
            @listenTo @model,
                "change:uses": (model, uses) -> @renderUses uses
        render: ->
            @$el.html(_.template(@template, @model.toJSON()))
            @renderUses(@model.get("uses"))
            @
        renderUses: (uses) ->
            console.log "re-rendering powers"
            @$(".uses").text(uses)
            if uses <= 0 then @$el.addClass "disabled"
        rangeHandler: (target)->
            target.tileModel.boundPower = @model
            target.tileModel.trigger "attackrange"
        chooseTargets: ->
            console.log @$el
            if @$el.hasClass "disabled" then return @
            user = @model.ownedBy
            if !user then return 
            opts = {diagonal: true, ignoreNPCs: true, storePath: false, ignoreDifficult: true, ignoreDeltas: true}
            battler.removeHighlighting()
            battler.setAttacks u = user.virtualMovePossibilities(null, @rangeHandler, 1, opts)
            battler.setState("choosingattacks")
        events: 
            "click": "chooseTargets"

    _potential_moves = null

    class Meter extends Backbone.View
        initialize: (attrs) ->
            link = @link = attrs.el.attr("linker")
            attr = attrs.model.get(link)
            max  = attrs.model.get("max_#{link}")
            @setMin 0
            @setMax max
            @setOptimum max
            @setHigh max - max/4
            @setLow max - (6*max)/7
            @setDisplay()
            @$el.attr("value", attr)
            @listenTo @model, "change:#{link}", (model, m) => 
                console.log "changing #{link}"
                @set m
                @setDisplay()
            @render()
        getValue: -> parseInt @$el.attr("value")
        set: (value)->
            @$el.attr("value", value)
                # time -= 20
            # , 20
            @
        setMin:  (min)  -> @$el.attr("min", min); @
        setMax:  (max)  -> @$el.attr("max", max); @
        setHigh: (high) -> @$el.attr("high", high); @
        setLow:  (low)  -> @$el.attr("low", low); @
        setOptimum: (optimum) -> @$el.attr("optimum", optimum); @
        setDisplay: -> @$el.attr("title", "#{@link}: #{@model.get(@link)}")
        hide: ->
            @visible = false
            @$el.fadeOut "fast"
            @
        show: () -> 
            @visible = true
            @$el.fadeIn "fast"
            @
        isVisible: -> @visible
        render: -> 
            @set @model.get @link
            @
        events: 
            click: -> console.log @model


    class AttributeViewer extends Backbone.View
        tagName: 'div'
        className: 'attribute-container'
        template: $("#attribute-container").html()
        initialize: (attrs) ->
            @render()
            @meters = {}
            h = @meters.health = new Meter el: @$("meter.HP"), model: attrs.model
            c = @meters.creatine = new Meter el: @$("meter.creatine"), model: attrs.model
            @listenTo @model.actions, "reduce", (actions) => @updateActions actions
            @
        render: ->
            @$el.html(_.template @template, _.extend(@model.toJSON(), {actions: @model.actions}))
        hide: ->
            @visible = false
            @$el.fadeOut "fast"
            _.each _menu_slots, (menu, i) =>
                if menu?.id is @id then _menu_slots[i] = null
            @
        show: () -> 
            bottom = if _menu_slots.bottom? then false else true
            @visible = true
            if bottom is true 
                @$el.addClass "bottom"
                _menu_slots.bottom = @
            else
                @$el.removeClass "bottom"
                _menu_slots.top = @
            # else @$el.removeClass "" Context switch weirds me out :/
            @$el.fadeIn "fast"
            @
        updateActions: (actions) ->
            actions = _.pick @model.actions, "move", "minor", "standard"
            _.each actions, (val, action) =>
                console.log "updating #{action} with #{val}"
                @$(".#{action}").text(val)


    # Basic manu view
    class Menu extends Backbone.View
        type: 'default'
        className: 'game-menu'
        template: $("#menu").html()
        type: 'battle'
        initialize: ->
            @setupMeters()
            @listenTo @model, 
                "beginphase": (phase) -> @$(".phase-number").text(phase + 1)
            _.bindAll @, "close", "open", "toggle", "selectNext", "selectThis", "selectPrev"
            @close()
            @render()
            @$el.appendTo $wrapper
        render: (quadrant = @model.getQuadrant()) ->
            extras = {phase: @model.turnPhase}
            @$el.html(_.template @template, _.extend(@model.toJSON(),extras))
            if quadrant then @$el.attr("quadrant", quadrant)
            @showPowers()
            @showInventory()
        setupMeters: ->
            container = @container = new AttributeViewer model: @model
            container.$el.appendTo $wrapper
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
                battler.removeHighlighting()
                _potential_moves = battler.getActive().virtualMovePossibilities()                
                battler.setPotentialMoves _potential_moves
                battler.setState("choosingmoves")
            # "click": -> board.$canvas.focus()
        clickActiveItem: ->
            @$el.children(".selected").trigger "click"
        close: ->
            @showing = false
            @$el.effect "slide", _.extend({mode: 'hide'}, {direction: 'right', easing: 'easeInOutQuart'}), 300
            board.unpause().focus()
            battler.removeHighlighting()
            @hideAttributeOverlay()
            @
        open: ->
            active_player = battler.getActive()
            battler.setState("menuopen")
            quadrant = @model.getQuadrant()
            _activemenu = @
            @showing = true 
            dir = if quadrant is 1 then "left" else "right"
            $(".game-menu").hide()
            $(".attribute-container").hide()
            @render(quadrant)
            @showAttributeOverlay()
            @$el.focus().select().effect "slide", _.extend({mode: 'show'}, {direction: dir, easing: 'easeInOutQuart'}) , 300
            @
        toggle: ->
            if @showing then @close()
            else @open()    
            @
        showAttributeOverlay: () ->
            @container.show()
            @
        hideAttributeOverlay: () ->
            @container.hide()
            @

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
        m: ->_menu_slots
    }
