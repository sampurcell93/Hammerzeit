define ["globals", "utilities", "dialog", "battler", "player", "npc", "board", "underscore", "backbone", "jquery-ui"], (globals, ut, dialog, battler, player, NPC, board) ->

    InventoryList = items.InventoryList

    # Basic manu view
    class Menu extends Backbone.View
        type: 'default'
        showInventory: ->
            list = new InventoryList collection: @model.get "inventory"
            console.log list.collection
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
            console.log @model
        render: ->
            super

    # Sub classed battle menu
    class BattleMenu extends Menu
        el: "#battle-menu"
        type: 'battle'
        render: ->

    _menus = {
        travel: new TravelMenu model: player.PC
        battle: new BattleMenu model: battler.getActivePlayer()
    }
    _activemenu = _menus['travel']


    toggleMenu = (menu) ->
        _menus[menu].toggle()
        other = if menu == "battle" then "travel" else "battle"
        other = _menus[other]
        board.toggleState("MENUOPEN")
        other.showing = false
        other.$el.hide()

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
