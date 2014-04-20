define ["globals", "utilities", "underscore", "backbone"], (globals, ut) ->

    # Since we're storing items in a json dictionary, 
    # functions need to be assignmed at runtime.
    # functions accept the target (npc model or subclass thereof) 
    # of the item's use, and should be called in the item's context
    _usefns = {
    }
    _wearfns = {
    }

    class Modifier extends Backbone.Model
        defaults: 
            # Which property is the modifier targeting?
            prop: null
            # By how much should it be modified? Can be a function.
            mod: 0
            # For how many turns should this last?
            turns: null
            # If this lasts for turns, when should it be evaluated? 
            # 0 = at the beginning of the affected's turn, 1 = at the end
            timing: 0
        prop: -> @get "prop"
        mod:  -> @get "mod"

    class ModifierCollection extends Backbone.Collection
        model: Modifier

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
            # If the item only modifies attributes, store the 
            modifiers: new ModifierCollection
            # When the item is used, do this
            use: -> 
            # When the item is worn, do this
            wear: -> 
        isNew: -> true
        initialize: ({name})->
            @on "change:equipped", (model, value) =>
                if value is true then @onEquip()
                else @onUnEquip()
        isEquipped: -> @get "equipped"
        canEquip: -> @get "canEquip"
        onEquip: (target = @belongsTo())->
            @get("equip")?.call(@, target)
            target.applyModifiers(@get "modifiers").takeAction(@get("action"))
            @
        onUnEquip: (target = @belongsTo()) ->
            target.removeModifiers @get "modifiers"
            @
        canUse: -> @get "canUse"
        onUse: (target = @belongsTo())-> 
            @get("use")?.call(@, target)
            @set("uses", @get("uses") - 1)
            if @get("uses") is 0 then @destroy()
            target.applyModifiers(@get "modifiers").takeAction(@get("action"))
            @
        belongsTo: (model) ->
            belongsTo = @get "belongsTo"
            if _.isUndefined(model) then return belongsTo
            else return _.isEqual(belongsTo, model)
        parse: (response) ->
            modifiers = new ModifierCollection
            _.each response.modifiers, (mod) =>
                modifiers.add new Modifier(mod)
            response.modifiers = modifiers
            response


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
        ModifierCollection: ModifierCollection
        Modifier: Modifier
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