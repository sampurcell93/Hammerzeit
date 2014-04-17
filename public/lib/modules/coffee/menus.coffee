define ["powers", "globals", "utilities", "dialog", "battler","board", "jquery-ui"], (powers, globals, ut, dialog, battler, board) ->

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
            @
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
            _.bindAll @, "chooseTargets"
            @listenTo @model,
                "change:uses": (model, uses) -> @renderUses uses
            @listenTo @model.ownedBy.actions, "change", @renderDisabled
        render: ->
            @$el.html(_.template(@template, @model.toJSON()))
            @renderUses(@model.get("uses"))
            @renderDisabled()
            @
        disable: ->
            @disabled = true
            @$el.addClass("disabled").removeClass "selected"
            @
        enable: ->
            @disabled = false
            @$el.removeClass "disabled"
            @
        isDisabled: -> @disabled
        renderUses: (uses) ->
            @$(".uses").text(uses)
            if uses <= 0 then @disable() else @enable()
            @
        renderDisabled: ->
            if !(@model.ownedBy.can(@model.get("action"))) then @disable()
            else @enable()
        chooseTargets: ->
            if @isDisabled() then return @
            user = @model.ownedBy
            if !user then return 
            battler.removeHighlighting()
            handler = @model.getHandler()
            opts = {ignoreNPCs: true, storePath: false, ignoreDifficult: true, ignoreDeltas: true, range: @model.get("range"), handlerContext: @model}
            opts = _.extend opts, @model.getPathOptions()
            battler.setAttacks u = battler.virtualMovePossibilities(user.getCurrentSpace(), handler, opts)
            battler.setState("choosingattacks")
        events: 
            "click": "chooseTargets"


    _potential_moves = null

    # A simple meter api for interacting with the HTML5 meter.
    # Pass in an "el" parameter to bind the view, and a model.
    class Meter extends Backbone.View
        # The "linker" attribute of the el determines the property to be 
        # represented in the meter. 
        initialize: ({model, el}) ->
            link = @link = el.attr("linker")
            attr = model.get(link)
            max  = model.get("max_#{link}") || attr
            @setMin 0
            @setMax max
            @setOptimum max
            @setHigh max - max/4
            @setLow max - (6*max)/7
            @setDisplay()
            @$el.attr("value", attr)
            @listenTo @model, "change:#{link}", (obj, m) => 
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

    # A list view for character stats, like Strength, Level, Race, etc. 
    # Handles object and nested objecte rendering, too.
    class StatList extends Backbone.View
        tagName: 'ul'
        className: 'attribute-list'
        template: "<li><span class='key'><%= key %>:</span> <%= val %></li>"
        objTemplate: "<li><span class='key'><%= key %>:</span> Some stuff</li>"
        render: ->
            @$el.empty()
            objects = []
            keys = Object.keys(@model).sort()
            _.each keys, (key) =>
                val = @model[key]
                key = key.capitalize()
                if _.isObject(val)
                    @$el.append(_.template(@objTemplate, key: key))
                    # @$el.append new StatList({model: val.models})
                else
                    if _.isString(val) then val = val.capitalize()
                    @$el.append(_.template(@template, {val: val, key: key}))
            @

    # Displays all states on a character, including HP, creatine, actions remaining, 
    # statistics, temporary effects, etc
    class CharacterStateDisplay extends Backbone.View
        tagName: 'div'
        className: 'attribute-container'
        template: $("#attribute-container").html()
        initialize: (attrs) ->
            cleanModel = _.omit @model.toJSON(), "creatine", "HP", "max_HP", "max_creatine", "current_chunk", "regY", "spriteimg", "frames"
            @attrlist = new StatList model: cleanModel
            @render()
            @meters = {}
            h = @meters.health = new Meter el: @$("meter.HP"), model: attrs.model
            c = @meters.creatine = new Meter el: @$("meter.creatine"), model: attrs.model
            @listenTo @model.actions, "change", (actions) => @updateActions actions
            @
        render: ->
            @$el.html(_.template @template, _.extend(@model.toJSON(), {actions: @model.actions}))
            @$(".full-attributes").html(@attrlist.render().el)
        hide: ->
            @visible = false
            @$el.slideUp "fast"
            @hideFullView()
            @
        show: () -> 
            @visible = true
            if @model.isActive() is false
                @$el.addClass "bottom"
            else
                @$el.removeClass "bottom"
            # else @$el.removeClass "" Context switch weirds me out :/
            @$el.slideDown "fast"
            @
        updateActions: (actions) ->
            actions = _.pick @model.actions, "move", "minor", "standard"
            _.each actions, (val, action) =>
                @$(".#{action}").text(val)
        showFullView: ->
            @fullViewOpen = true
            @$(".js-toggle-full").text("Less")
            @$(".full-attributes").slideDown "fast"
            @
        hideFullView: ->
            @fullViewOpen = false
            @$(".js-toggle-full").text("More")
            @$(".full-attributes").slideUp "fast"
            @
        toggleFullView: (e) ->
            if @fullViewOpen is true 
                @hideFullView()
            else
                @showFullView()
            @
        events: 
            "click .js-toggle-full": "toggleFullView"

    # Contains template for rendering a battle menu with action options
    # Contains subclasses, including Meters and CharacterStateDisplay
    class Menu extends Backbone.View
        type: 'default'
        className: 'game-menu'
        template: $("#menu").html()
        type: 'battle'
        initialize: ->
            @setupMeters()
            @listenTo @model, 
                "beginphase": (phase) -> @$(".phase-number").text(phase + 1)
            @listenTo @model.actions, "change", (actions) => @updateActions actions
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
            @updateActions @model.actions
        setupMeters: ->
            container = @container = new CharacterStateDisplay model: @model
            container.$el.appendTo $wrapper
            @
        # When actions are used, re-render that portion of the view
        updateActions: (actions) ->
            model = @model
            @$el.children("ul").children("li[actiontype]").each ->
                $t = $ @
                needed = $t.attr("actiontype")
                if !model.can(needed)
                    $t.addClass("disabled")
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
                $t = $(e.currentTarget)
                if $t.hasClass "disabled"
                    e.stopPropagation()
                    e.stopImmediatePropagation()
                    e.preventDefault()
                    return @
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
                console.log "specific click"
                battler.removeHighlighting()
                _potential_moves = battler.virtualMovePossibilities @model.getCurrentSpace(), null, {range: @model.get("spd")}
                battler.setPotentialMoves _potential_moves
                battler.setState("choosingmoves")
            "click .js-defend": ->
                if @model.can("move") then @model.defend()
            "click .js-end-turn": -> @model.endTurn()
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
    }
