define ["powers", "globals", "utilities", "dialog", "battler", "player", "npc", "board", "underscore", "backbone", "jquery-ui"], (powers, globals, ut, dialog, battler, player, NPC, board) ->

    board.focus()


    # Close all menus
    globals.shared_events.on "closemenus", ->
        closeAll()

    globals.shared_events.on "openmenu", ->
        _activemenu.open()

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
                opts = {diagonal: true, ignoreNPCs: true, storePath: false}
                battler.setAttacks u = user.virtualMovePossibilities(null, @rangeHandler, 1, opts)
                console.log u
                battler.setState("choosingattacks")

    _potential_moves = null

    # Basic manu view
    class Menu extends Backbone.View
        type: 'default'
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
            # "click": -> board.$canvas.focus()
        render: ->
            @showInventory()
        clickActiveItem: ->
            @$el.children(".selected").trigger "click"
        close: ->
            _activemenu = null
            @showing = false
            @$el.effect "slide", _.extend({mode: 'hide'}, {direction: 'right', easing: 'easeInOutQuart'}), 300
            board.unpause().focus()
            battler.clearPotentialMoves()
        reBind: (newmodel) ->
            @stopListening @model
            @model = newmodel
            @listenTo @model,
                "beginphase": (phase) ->
                    console.log "in watcher"
                    console.log phase+1
                    @$(".phase-number").text(phase + 1)
            @
        open: ->
            active_player = battler.getActive()
            battler.setState("menuopen")
            if active_player then @reBind(active_player)
            else return @
            quadrant = @model.getQuadrant()
            _activemenu = @
            @showing = true 
            @render(quadrant)
            board.pause()
            dir = if quadrant is 1 then "left" else "right"
            @$el.focus().select().effect "slide", _.extend({mode: 'show'}, {direction: dir, easing: 'easeInOutQuart'}) , 300
        toggle: ->
            if @showing then @close()
            else @open()    



    # Subclassed travel menu
    class TravelMenu extends Menu
        el: "#travel-menu"
        type: 'travel'
        initialize: ->
            _.bindAll @, "close", "open", "toggle", "selectNext", "selectThis", "selectPrev"
        render: ->
            super
            PC = @model.toJSON()
            @$(".HP").text PC.HP

    # Sub classed battle menu
    class BattleMenu extends Menu
        tagName: 'ul'
        className: 'game-menu'
        template: $("#battle-menu").html()
        type: 'battle'
        open: ->
            super
            board.unpause()
        render: (quadrant)->
            @$el.html(_.template @template, _.extend(@model.toJSON(),{phase: @model.turnPhase}))
            if quadrant then @$el.attr("quadrant", quadrant)
            @showPowers()
            super
        initialize: ->
            @$el.attr("id", "battle-menu")
            _.bindAll @, "close", "open", "toggle", "selectNext", "selectThis", "selectPrev"
            @events = _.extend @events, @child_events
        
        child_events:
            # Creates an overlay on the 
            "click .js-virtual-move": -> 
                battler.clearPotentialMoves()
                console.log battler.getActive()
                _potential_moves = battler.getActive().virtualMovePossibilities()                
                console.log _potential_moves
                battler.setPotentialMoves _potential_moves
                battler.setState("choosingmoves")

    _menus = window._menus = {
        travel: new TravelMenu model: player.PC
        battle: new BattleMenu model: battler.getActive({player: true})
    }
    _activemenu = _menus['battle']
    _activemenu.$el.appendTo(".wrapper")

    toggleMenu = (menu) ->
        _activemenu = _menus[menu]
        other = if menu == "battle" then "travel" else "battle"
        _activemenu.toggle()
        _menus[other].close()
        board.toggleState("MENUOPEN")

    closeAll = ->
        _.each _menus, (menu) -> 
            menu.close()
            board.removeState "MENUOPEN"

    {    
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
        battleMenu: _menus["battle"]
        travelMenu: _menus['travel']
    }
