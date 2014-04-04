define ["globals", "utilities", "underscore", "backbone"], (globals, ut) ->

    # Since we're storing items in a json dictionary, 
    # functions need to be assignmed at runtime.
    # functions accept the target of the item's use (NPC.toJSON()) and the level of the item
    _usefns = {
        "Tattered Cloak": (t, l) -> 
    }
    _wearfns = {
        "Tattered Cloak": (t, l) -> t.ac += 1
    }

    class Item extends Backbone.Model
        defaults: ->
            name: 'Unknown'
            # When the item is used, do this
            use: -> 
            # When the item is worn, do this
            wear: ->
            weight: 1
            belongsTo: null
            level: 1
            role: 1
            equipped: false
        idAttribute: 'name'

    # Simply a collection of items, regardless of context
    class Inventory extends Backbone.Collection
        model: Item
        parse: (resp) ->
            _.each resp, (item) ->
                item.use  = _usefns[item.name]  || ->
                item.wear = _wearfns[item.name] || ->
            resp
        comparator: (model) ->
            -model.get("equipped")

    # Inventory List View
    class InventoryList extends Backbone.View
        tagName: 'ul'
        initialize: ->
            _.bindAll @, "render", "addItem"
        addItem: (item) ->
            item = new ItemView model: item
            item.render().$el.appendTo @$el
        render: ->
            @$el.empty()
            _.each @collection.models, @addItem
            @

    class ItemView extends Backbone.View
        tagName: 'li'
        template: $("#inventory-item").html()
        render: ->
            @$el.html(_.template @template, @model.toJSON())
            @


    _items = new Inventory
    _items.url = "lib/json_packs/items.json"
    _items.fetch 
        success: (coll, resp) -> 
            _items = Object.freeze coll
        error: (coll, resp) ->
            console.error resp
        parse: true

    getItem = (name) ->
        item = _items._byId[name]
        if typeof item is "object" then Object.freeze(item)
        else null

    return window.items = {
        Item: (construction) -> new Item(construction)
        Inventory: (construction) -> new Inventory(construction)
        InventoryList: (construction) -> new InventoryList(construction)
        ItemView: (construction) -> new ItemView(construction)
        # Pass in item name (also ID) and the Item model is returned
        # Can also pass in string array, and an inventory object will be returned
        get: (name) -> 
            if typeof name is "string" then return getItem name
            else if $.isArray name 
                inventory = new Inventory
                _.each name, (id) ->
                    inventory.add getItem id
                inventory


    }