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
            # Is this effect permanant?
            perm: false
        prop: -> @get "prop"
        mod:  -> @get "mod"

    class ModifierCollection extends Backbone.Collection
        model: Modifier

    class Slots extends Backbone.Model
        defaults: ->
            slots = ["head", "hands", "feet", "neck", "waist", "armor", "legs"]
            obj = {}
            _.each slots, (slot) =>
                obj[slot] = null
            obj



    class Item extends Backbone.Model
        idAttribute: 'name'
        defaults: 
            action: 'minor'
            belongsTo: null
            canEquip: false
            canUse: true
            equipped: false
            level: 1
            max_uses: 1
            # If the item modifies attributes, store them
            modifiers: new ModifierCollection
            name: null
            quantity: 1
            role: 1
            slot: "Hands"
            uses: 1
            weight: 1
            # When the item is used, do this
            use: -> 
            # When the item is worn, do this
            wear: -> 
        isNew: -> true
        initialize: ({name, max_uses})->
            @on "change:equipped", (model, value) =>
                if value is true then @onEquip()
                else @onUnEquip()
            @set "uses", max_uses
        isEquipped: -> @get "equipped"
        isEquippable: -> @get "canEquip"
        onEquip: (target = @belongsTo())->
            @get("equip")?.call(@, target)
            target.applyModifiers(@get "modifiers").takeAction(@get("action"))
            @
        onUnEquip: (target = @belongsTo()) ->
            target.removeModifiers @get "modifiers"
            @
        isUsable: -> @get "canUse"
        onUse: (target = @belongsTo())-> 
            @get("use")?.call(@, target)
            # Decrement the item's uses
            @set("uses", @get("uses") - 1)
            # If no uses left, the item is expended
            if @get("uses") is 0  
                @set("quantity", @get("quantity") - 1)
                # If no more of item, destroy this
                if @get("quantity") is 0
                    @destroy()
                # Otherwise, reset the use count
                else @set("uses", @get("max_uses"))
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
        getTotalItems: ->
            sum = 0
            _.each @models, (item) =>
                sum += item.get "quantity"
            sum

    _items = new Inventory
    _items.url = "lib/json_packs/items.json"
    _items.fetch 
        success: (coll, resp) -> 
            globals.shared_events.trigger "items_loaded"
        error: (coll, resp) ->
            console.error resp
        parse: true

    getItem = (name, opts={}) ->
        item = _items._byId[name]
        if _.isObject(item)
            item = item.clone()
            if opts.belongsTo 
                item.set "belongsTo", opts.belongsTo
            return item
        else null

    get = (name, opts) ->
        if typeof name is "string" then return getItem name, opts
        else if $.isArray name 
            inventory = new Inventory
            _.each name, (id) ->
                inventory.add getItem(id, opts)
            inventory

    return window.items = {
        Item: (construction) -> new Item(construction)
        Slots: -> new Slots
        Inventory: Inventory
        ModifierCollection: ModifierCollection
        Modifier: Modifier
        # Inventory: (construction) -> new Inventory(construction)
        # InventoryList: (construction) -> new InventoryList(construction)
        # ItemView: (construction) -> new ItemView(construction)
        # Pass in item name (also ID) and the Item model is returned
        # Can also pass in string array, and an inventory object will be returned
        get: (name, opts={}) -> 
            get name, opts
        getDefaultInventory: (opts = {}) ->
            d = get ["Tattered Cloak", "Bread"]
            if opts.belongsTo and d
                _.each d.models, (item) =>
                    item.set("belongsTo", opts.belongsTo)
            d
    }