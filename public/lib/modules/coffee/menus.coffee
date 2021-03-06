define ["cast", "taskrunner", "powers", "globals", "utilities", "battler", "board", "jquery-ui"], (cast, taskrunner, powers, globals, ut, battler, board) ->

    board.focus()
    stage = board.getStage()

    _menus = []
    $wrapper = $(".wrapper")

    _activemenu = null
    _dispatchmenu = null
    # Close all menus
    globals.shared_events.on "menu:close", ->
        closeAll()

    globals.shared_events.on "menu:open", ->
        _activemenu.open()

    globals.shared_events.on "menu:bind", (character) ->
        _activemenu = character.menu = new Menu model: character, type: 'battle'
        _menus.push _activemenu

    globals.shared_events.on "state:travel", ->
        _activemenu = new Menu model: taskrunner.getPC(), template: $("#travel-menu").html(), type: 'travel'

    battler.events.on "showDispatchMenu", (collection) ->
        closeAll()
        _dispatchmenu = new DispatchMenu collection: collection
        _dispatchmenu.$el.appendTo $wrapper


    class PlayerDispatch extends Backbone.View
        template: $("#dispatch-menu-item").html()
        tagName: 'li'
        initialize: ->
            @listenTo @model, "dispatch", @render
        render: ->
            character = @model
            @$el.html _.template @template, _.extend(character.toJSON(), {d: character.dispatched, i: character.i})
            if character.isDead() then @$el.addClass("dead")
            @
        events: 
            "mouseover": (e) -> 
                display = new CharacterList collection: new Backbone.Collection([@model])
                ut.launchModal display.render().$el
                e.stopPropagation()
                e.stopImmediatePropagation()
                if @model.isDispatched() is false
                    battler.potentialDispatch @model
            "mouseleave": -> battler.discardDispatch()
            "click": -> 
                battler.confirmDispatch()
                @$el.fadeOut "fast", => @remove()


    class DispatchMenu extends Backbone.View
        tagName: 'ul'
        className: 'game-menu visible'
        initialize: -> @render()
        render: ->
            @$el.empty()
            @collection.sort()
            _.each @collection.models, (character) =>
                if character.isDispatched() then return
                player = new PlayerDispatch model: character
                @$el.append player.render().el
            @
        show: ->
            @$el.slideDown "fast"
        hide: ->
            @$el.slideUp "fast"
        events: ->


    class InventoryList extends Backbone.View
        tagName: 'ul'
        className: 'inventory-list'
        initialize: ->
            _.bindAll @, "render", "addItem"
            @listenTo @collection, 
                "add": (item, coll) =>
                    @addItem item, true

            @
        addItem: (item, append=false) ->
            item = new ItemView model: item
            if append is true
                item.render().$el.appendTo @$el
            item
        render: ->
            @$el.empty()
            frag = document.createDocumentFragment()
            @collection.sort()
            _.each @collection.models, (item)=> 
                view = @addItem(item)
                frag.appendChild view.render().el
            @$el.append frag
            @

    class ItemView extends Backbone.View
        tagName: 'li'
        className: 'inventory-item'
        template: $("#inventory-item").html()
        initialize: ->
            @listenTo @model, 
                "change:equipped": @render
                "change:quantity": (model, quantity) =>
                    @$(".js-quantity").text(quantity)
                "remove destroy": =>
                    @$el.addClass("disabled")
                    setTimeout =>
                        @$el.fadeOut "fast", =>
                            @remove()
                    , 300
            _.bindAll @, "renderSmallView", "render"

            @
        renderSmallView: ->
            @$el.empty()
            @$el.html(_.template @template, @model.toJSON())
        render: ->
            @renderSmallView()
            if !@more
                @more = new StatList model: @model
                @$el.append @more.render().el
            @
        events: 
            "click .js-show-more": (e) ->
                @$(".attribute-list").slideToggle()
                e.stopPropagation()
                e.stopImmediatePropagation()
            "click .js-equip": ->
                @model.belongsTo().equip(@model)
            "click .js-unequip": ->
                @model.belongsTo().unequip(@model)
            "click .js-use": ->
                @model.onUse.call(@model, @model.belongsTo())

    class PowerList extends Backbone.View
        tagName: 'ul'
        className: 'power-list'
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
            @listenTo @model.belongsTo().actions, "change", @checkDisabled
        render: ->
            @$el.html(_.template(@template, _.extend(@model.toJSON(), rangedisplay: @model.getRangeDisplay())))
            more = new StatList model: @model
            @$el.append more.render().el
            @renderUses(@model.get("uses"))
            @checkDisabled()
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
            @$(".uses").html(if isFinite(uses) then uses else "&infin;")
            if uses <= 0 then @disable()
            @
        checkDisabled: ->
            if !(@model.belongsTo().can(@model.get("action"))) then @disable()
            else @enable()
        chooseTargets: ->
            if @isDisabled() then return @
            user = @model.belongsTo()
            if !user then return 
            battler.removeHighlighting()
            handler = @model.getHandler()
            opts = {ignoreNPCs: true, storePath: false, ignoreDifficult: true, ignoreDeltas: true, range: @model.get("range"), handlerContext: @model}
            opts = _.extend opts, @model.getPathOptions()
            battler.setAttacks m = battler.virtualMovePossibilities(user.getCurrentSpace(), handler, opts)
            battler.setState("choosingattacks")
        events: 
            "click": (e) ->
                @$el.parent().hide()
                @chooseTargets()
                e.stopPropagation()
                e.stopImmediatePropagation()
            "click .attribute-list": (e) ->
                e.stopPropagation()
                e.stopImmediatePropagation()
            "click .js-show-more": (e) ->
                @$(".attribute-list").slideToggle()
                e.stopPropagation()
                e.stopImmediatePropagation()

    _potential_moves = null

    # A simple meter api for interacting with the HTML5 meter.
    # Pass in an "el" parameter to bind the view, and a model.
    class Meter extends Backbone.View
        # The "linker" attribute of the el determines the property to be 
        # represented in the meter. 
        initialize: ({model, el}) ->
            link = @link = el.attr("linker")
            attr = model.get(link)
            max = @max  = model.get("max_#{link}") || attr
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
        setDisplay: -> @$el.attr("title", "#{@link}: #{@model.get(@link)}/#{@max}")
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

    # A list view for character stats, like Strength, Level, Race, etc. Or any key val object really
    # Handles object and nested object rendering, too.
    class StatList extends Backbone.View
        tagName: 'ul'
        className: 'attribute-list'
        template: "<li class='stat-item'><%= key %>: <%= val %></li>"
        objTemplate: $("#stat-list-obj").html()
        launchOpts: {
            destroyOthers: false
        }
        initialize: ->
            # Lazy. todo: fix
            @listenTo @model, "change", @render
        render: ->
            @$el.empty()
            model = if @model.clean then @model.clean() else @model.toJSON()
            objects = []
            _.each Object.keys(model).sort(), (key) =>
                val = model[key]
                key = key.capitalize().replace("_"," ")
                if _.isObject(val)
                    objects.push({key: key, val: val})
                else
                    if _.isString(val) then val = val.capitalize()
                    @$el.append(_.template(@template, {val: val, key: key}))
            _.each objects, (obj) =>
                @$el.append _.template @objTemplate, {key: obj.key}
            @
        events: ->
            "click .js-show-Inventory": ->
                l = new InventoryList collection: @model.get("inventory")
                ut.launchModal l.render().el, @launchOpts
            "click .js-show-Powers": ->
                l = new PowerList collection: @model.get("powers")
                ut.launchModal l.render().el, @launchOpts

    # Displays all states on a character, including HP, creatine, actions remaining, 
    # statistics, temporary effects, etc
    class CharacterStateDisplay extends Backbone.View
        className: 'attribute-container'
        template: $("#attribute-container").html()
        initialize: ({model, tagName}) ->
            # if tagName then @setElement(@make(tagName, _(@attributes).extend(class: @className)))
            @attrlist = new StatList model: @model
            @render()
            @meters = {}
            h = @meters.health = new Meter el: @$("meter.HP"), model: model
            c = @meters.creatine = new Meter el: @$("meter.creatine"), model: model
            @listenTo @model.actions, "change", (actions) => @updateActions actions
            @
        render: ->
            @$el.html(_.template @template, _.extend(@model.toJSON(), {actions: @model.actions}))
            @$el.append @attrlist.render().el
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
        updateActions: (actions=_.pick @model.actions, "move", "minor", "standard") ->
            _.each actions, (val, action) =>
                @$(".#{action}").text(val)
        showFullView: ->
            @fullViewOpen = true
            @$(".js-toggle-full").text("Less")
            @$(".attribute-list").slideDown "fast"
            @
        hideFullView: ->
            @fullViewOpen = false
            @$(".js-toggle-full").text("More")
            @$(".attribute-list").slideUp "fast"
            @
        toggleFullView: (e) ->
            if @fullViewOpen is true 
                @hideFullView()
            else
                @showFullView()
            @
        events: 
            "click .js-toggle-full": "toggleFullView"

    class CharacterList extends Backbone.View
        tagName: 'ul'
        className: 'character-list'
        initialize: ->
            _.bindAll @, "render"
        render: ->
            _.each @collection.models, (char) =>
                display = new CharacterListItem({model: char})
                @$el.append(display.el)
            @

    class CharacterListItem extends CharacterStateDisplay
        tagName: 'li'


    # Contains template for rendering a battle menu with action options
    # Contains subclasses, including Meters and CharacterStateDisplay
    class Menu extends Backbone.View
        className: 'game-menu'
        initialize: ({@type, template})->
            if template then @template = template
            else @template = $("#menu").html() 
            @setupMeters()
            @listenTo @model, 
                "beginphase": (phase) -> @$(".phase-number").text(phase + 1 + "/3")
                "change:inventory": @renderInventory
                "change:powers": @renderPowers
            @listenTo @model.actions, "change", (actions) => @updateActions actions
            @listenTo @model.get("inventory"), 
                "remove": (model, collection) =>
                    if collection.length is 0 then @$(".js-show-inventory").addClass("disabled")
                "remove add": (model, collection) =>
                    @$(".inventory-length").text(collection.getTotalItems())
                "change:quantity": (model, value, options) ->
                    @$(".inventory-length").text(@model.get("inventory").getTotalItems())


            _.bindAll @, "close", "open", "toggle", "selectNext", "selectThis", "selectPrev"
            @close()
            @render()
            @$el.appendTo $wrapper
        render: () ->
            extras = {phase: @model.turnPhase}
            @$el.html(_.template @template, _.extend(@model.toJSON(),extras))
            @renderPowers()
            @renderInventory()
            @updateActions @model.actions
            @$(".inventory-length").text(@model.get("inventory").getTotalItems())
            @
        # Get the quadrant of the selected model, then render this in another quadrant
        setPosition: (quadrant = @model.getQuadrant())->
            @$el.attr("quadrant", quadrant)
        isBattleMenu: -> @type is "battle"
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
        renderParty: ->
            @partylist = new CharacterList({collection: taskrunner.getParty()})
            ut.launchModal ["<h2>Party:</h2>", @partylist.render().el], {className: 'character-modal'}
        renderInventory: ->
            @inventorylist = list = new InventoryList collection: @model.get "inventory"
            @$(".inventory-list").html(list.render().el)
            @
        renderPowers: ->
            @powerlist = list = new PowerList collection: @model.get "powers"
            @$(".power-list").html(list.render().el)
            @
        selectThis: ($item) ->
            $item.addClass("selected").
            siblings(".selected").removeClass("selected").
            find(".nested-menu > ul").hide()
            $item.find(".nested-menu > ul").show()
            @
        selectNext: ->
            @selectThis @$el.children(".selected").next()
        selectPrev: ->
            @selectThis @$el.children(".selected").prev()
        events:
            "click .js-close-menu": -> @close()
            "click .js-save-game": -> globals.shared_events.trigger("game:save")
            "click .js-show-inventory": (e) ->
                e.stopPropagation()
            "click .js-show-party": 'renderParty'
            "click .js-show-enemies": ->
                @enemylist = new CharacterList({collection: battler.getEnemies()})
                ut.launchModal ["<h2>Enemies:</h2>", @enemylist.render().el]
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
                battler.removeHighlighting()
                console.log @model.getCurrentSpace()
                _potential_moves = battler.virtualMovePossibilities @model.getCurrentSpace(), null, 
                    {range: @model.get("spd"), jump: @model.get("jmp")}
                battler.setPotentialMoves _potential_moves
                battler.setState("choosingmoves")
            "click .js-defend": ->
                if @model.can("move") then @model.defend()
            "click .js-end-turn": -> @model.endTurn()
            "click .js-close-modals": -> ut.destroyModal()
            "click .js-upgrade": ->
                leveler = new cast.LevelerView( collection: taskrunner.getParty() )
                ut.launchModal leveler.render().el, {isolate: true, className: 'large'}

            # "click": -> board.$canvas.focus()
        clickActiveItem: ->
            @$el.children(".selected").trigger "click"
        close: ->
            @showing = false
            @$el.effect "slide", _.extend({mode: 'hide'}, {direction: 'right', easing: 'easeInOutQuart'}), 300
            ut.destroyModal()
            board.unpause().focus()
            if @isBattleMenu()
                battler.removeHighlighting()
            @hideAttributeOverlay()
            @
        open: ->
            quadrant = @model.getQuadrant()
            _activemenu = @
            @showing = true 
            dir = if quadrant is 1 then "left" else "right"
            $(".game-menu").hide()
            $(".attribute-container").hide()
            @setPosition(quadrant)
            @render()
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
        if _activemenu
            _activemenu.close()
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
