define ["globals", "utilities", "dialog", "battler", "player", "npc", "board", "underscore", "backbone", "jquery-ui"], (globals, ut, dialog, battler, player, NPC, board) ->

    InventoryList = items.InventoryList

    # Basic manu view
    class Menu extends Backbone.View
        type: 'default'
        showInventory: ->
            list = new InventoryList collection: @model.get "inventory"
            list.render()
            @
        selectThis: ($item) ->
            $item.addClass("selected").
            siblings(".selected").removeClass("selected")
            @
        selectNext: ->
            @selectThis @$el.children(".selected").next()
        selectPrev: ->
            @selectThis @$el.children(".selected").prev()
        events:
            "click .js-close-menu": ->
                toggleMenu @type
            "click .js-show-inventory": (e) ->
                @showInventory()
                e.stopPropagation()
            "click li": (e) ->
                @selectThis $(e.currentTarget)
            "keyup": (e) ->
                key = e.keyCode || e.which
                if key == 38 then @selectPrev()
                else if key == 40 then @selectNext()
        render: ->
            @showInventory()
            PC = @model.toJSON()
            @$(".HP").text PC.HP
        clickActiveItem: ->
            @$el.children(".selected").trigger "click"
        close: ->
            console.log @
            @showing = false
            @$el.effect "slide", _.extend({mode: 'hide'}, {direction: 'right', easing: 'easeInOutQuart'}), 300
            board.unpause().$canvas.focus()
        open: ->
            _activemenu = @
            @showing = true 
            @render()
            board.pause()
            @$el.effect "slide", _.extend({mode: 'show'}, {direction: 'right', easing: 'easeInOutQuart'}) , 300
        toggle: ->
            if @showing then @close()
            else @open()    



    # Subclassed travel menu
    class TravelMenu extends Menu
        el: "#travel-menu"
        type: 'travel'
        initialize: ->
        render: ->
            super

    # Sub classed battle menu
    class BattleMenu extends Menu
        el: "#battle-menu"
        type: 'battle'
        open: ->
            super
            board.unpause()
        render: ->
            super
        initialize: ->
            @events = _.extend @events, @child_events
            console.log @events
        child_events:
            # Creates an overlay on the 
            "click .js-virtual-move": -> 
                console.clear()
                # Reflected in the battler grid via observation pattern
                p = battler.getActivePlayer().virtualMovePossibilities(false)
                ut.c p


    _menus = window._menus = {
        travel: new TravelMenu model: player.PC
        battle: new BattleMenu model: battler.getActivePlayer()
    }
    _activemenu = _menus['travel']


    toggleMenu = (menu) ->
        other = if menu == "battle" then "travel" else "battle"
        _menus[other].close()
        _menus[menu].toggle()
        board.toggleState("MENUOPEN")

    closeAll = ->
        _.each _menus, (menu) -> 
            menu.close()
            board.removeState "MENUOPEN"

    {    
        toggleMenu: (menu) -> toggleMenu menu
        selectNext: -> _activemenu.selectNext()
        selectPrev: -> _activemenu.selectPrev()
        activateMenuItem: -> _activemenu.clickActiveItem()
        closeAll: -> closeAll()
    }
