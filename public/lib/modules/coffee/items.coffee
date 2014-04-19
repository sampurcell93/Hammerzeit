define ["globals", "utilities", "underscore", "backbone"], (globals, ut) ->

    # Since we're storing items in a json dictionary, 
    # functions need to be assignmed at runtime.
    # functions accept the target (npc model or subclass thereof) 
    # of the item's use, and should be called in the item's context
    _usefns = {
        "Tattered Cloak": (t) -> t.takeDamage(4)
        "Bread": (t) -> t.takeDamage(4)
    }
    _wearfns = {
        "Tattered Cloak": (t) ->  t.set("AC", t.get("AC") + 2)
    }

    class Item extends Backbone.Model
        idAttribute: 'name'
        defaults: 
            name: null
            weight: 1
            belongsTo: null
            level: 1
            role: 1
            uses: 1
            equipped: false
            canUse: true
            canEquip: false
            action: 'minor'
            # When the item is used, do this
            use: -> 
            # When the item is worn, do this
            wear: -> 
        isNew: -> true
        initialize: ->
            @on "change:equipped", (model, value) =>
                if value is true then @onEquip()
                else @onUnEquip()
        isEquipped: -> @get "equipped"
        canEquip: -> @get "canEquip"
        onEquip: ->
            @get("wear")?.call(@, @get("belongsTo"))
            @
        onUnEquip: ->
        canUse: -> @get "canUse"
        onUse: (target = @belongsTo())-> 
            @get("use")?.call(@, target)
            @set("uses", @get("uses") - 1)
            if @get("uses") is 0 then @destroy()
            @
        belongsTo: -> @get "belongsTo"


    # Simply a collection of items, regardless of context
    class Inventory extends Backbone.Collection
        model: Item
        type: 'Inventory'
        parse: (resp) ->
            _.each resp, (item) ->
                item.use  = _usefns[item.name]  || ->
                item.wear = _wearfns[item.name] || ->
            resp
        comparator: (model) ->
            -model.get("equipped")

    _items = new Inventory
    _items.url = "lib/json_packs/items.json"
    _items.fetch 
        success: (coll, resp) -> 
            globals.shared_events.trigger "items_loaded"
        error: (coll, resp) ->
            console.error resp
        parse: true

    getItem = (name) ->
        item = _items._byId[name]
        if _.isObject(item) then item.clone()
        else null

    get = (name) ->
        if typeof name is "string" then return getItem name
        else if $.isArray name 
            inventory = new Inventory
            _.each name, (id) ->
                inventory.add getItem id
            inventory

    return window.items = {
        Item: (construction) -> new Item(construction)
        # Inventory: (construction) -> new Inventory(construction)
        # InventoryList: (construction) -> new InventoryList(construction)
        # ItemView: (construction) -> new ItemView(construction)
        # Pass in item name (also ID) and the Item model is returned
        # Can also pass in string array, and an inventory object will be returned
        get: (name) -> 
            get name
        getDefaultInventory: (opts = {}) ->
            d = get ["Tattered Cloak", "Bread"]
            if opts.belongsTo and d
                _.each d.models, (item) =>
                    item.set("belongsTo", opts.belongsTo)
            d
    }