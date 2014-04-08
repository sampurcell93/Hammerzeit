define ["globals", "utilities", "board"], (globals, utilities, board) ->
    _powers = null
    _default = ["Strike", "Beguile", "Plead"]

    class Power extends Backbone.Model
        defaults:
            creatine: 3
            power: 1
            range: 3
            type: "single"
            name: "Basic"
            uses: Infinity
            damage: 1
            modifier: 4
            action: 'standard'
        idAttribute: 'name'
        use: ->
            @set("uses", @get("uses") - 1)
            @

    class PowerSet extends Backbone.Collection
        model: Power
        type: 'PowerSet'
        url: 'lib/json_packs/attacks.json'

    _useFns = {
        "Strike": (target, attacker) -> 
            target.useCreatine(3)
            console.log "stole your creatine bro"
    }

    _powers = new PowerSet(
        [
            {"name": "Strike", "damage": 2, "uses": 1, "modifier": 4},
            {"name": "Beguile", "action": "move", "uses": 3},
            {"name": "Plead", "action": "minor"}
        ]
    )
    _.each _powers.models, (power) ->
        use = _useFns[power.get("name")]
        if use then power.set("use" , use)
    # _powers.fetch 
    #     success: ->
    #         console.log _powers
    #         globals.shared_events.trigger "powers_loaded"
    #     parse: true

    getPower = (name) ->
        power = _powers._byId[name]
        if typeof power is "object" then power.clone()
        else null

    get = (name) ->
        if typeof name is "string" then return getPower name
        else if $.isArray name 
            subset = new PowerSet
            _.each name, (id) ->
                power = get id
                unless subset.indexOf(power) isnt -1 then subset.add power
            return subset

    getClassDefaults: (c) ->


    window.powers = {    
        # gets the generalized defaults. If a class is passed in, gets the defaults for that class
        defaultPowers: (c) -> 
            d = get _default
        # Accepts a string with the name of the power, or an array of strings. Either a Power Model or a PowerSet is returned.
        get: (name) -> get name
        # Do not provice direct class access
        PowerSet: (models, construction) -> new PowerSet(models, construction)
        PowerList: (construction) -> new PowerList(construction)

    }
