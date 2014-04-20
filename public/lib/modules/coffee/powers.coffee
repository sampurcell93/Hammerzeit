define ["globals", "utilities", "board", "items"], (globals, utilities, board, items) ->
    _powers = null
    _default = ["Strike", "Arrow","Whirl"]

    _pathopts = {
        "range": {}
        "burst": {
            diagonal: true
        }
    }

    class Power extends Backbone.Model
        defaults:
            creatine: 0
            power: 1
            range: 1
            name: 'Basic'
            uses: Infinity
            damage: 1
            modifier: 4
            action: 'standard'
            spread: 'range'
            defense: 'AC'
            belongsTo: null
        idAttribute: 'name'
        use: (subject, opts={take_action: true}) ->
            attacker = @belongsTo()
            use = @get "use"
            if _.isFunction(use) then use.call(@, subject, attacker)
            @set("uses", @get("uses") - 1)
            attacker.useCreatine(@get "creatine")
            attacker.takeAction(@get "action") unless opts.take_action is false
            @
        initialize: ->
            _.bind @handlers.range, @
            _.bind @handlers.burst, @
        handlers: 
            range: (target) ->
                target.tileModel.boundPower = @
                target.tileModel.trigger "rangeattack"
            burst: (target) ->
                target.tileModel.boundPower = @
                if target.tileModel.isOccupied()
                    target.tileModel.trigger "burstattack"
        # Return the function which is performed on each square in the power's attack zone
        # This function is dependent on the spread of the attack
        getHandler: -> @handlers[@get "spread"]
        # Return the options to extend onto the default path construction options
        getPathOptions: -> _pathopts[@get "spread"]
        getRangeDisplay: ->
            if @get("spread") isnt "range"
                @get("spread").charAt(0).toUpperCase() + @get("range")
            else @get "range"
        belongsTo: -> @get "belongsTo"



    class PowerSet extends Backbone.Collection
        model: Power
        type: 'PowerSet'
        url: 'lib/json_packs/attacks.json'

    _useFns = {
        "Strike": (target, attacker) -> 
            target.useCreatine(3)
    }

    _powers = new PowerSet
    _powers.fetch
        success: ->
            _.each _powers.models, (power) ->
                use = _useFns[power.get("name")]
                if use then power.set("use" , use)
            globals.shared_events.trigger "powers_loaded"
    # _powers.fetch 
    #     success: ->
    #         console.log _powers
    #         globals.shared_events.trigger "powers_loaded"
    #     parse: true

    getPower = (name) ->
        power = _powers._byId[name]
        if _.isObject(power) then power.clone()
        else null

    get = (name) ->
        if _.isString(name) then return getPower name
        else if $.isArray name 
            subset = new PowerSet
            _.each name, (id) ->
                power = get id
                unless subset.indexOf(power) isnt -1 then subset.add power
            return subset

    getClassDefaults: (c) ->


    window.powers = {    
        # gets the generalized defaults. If a class is passed in, gets the defaults for that class
        getDefaultPowers: (opts={}) -> 
            d = get _default
            if opts.belongsTo
                _.each d.models, (power) =>
                    power.set("belongsTo", opts.belongsTo)
            d

        # Accepts a string with the name of the power, or an array of strings. Either a Power Model or a PowerSet is returned.
        get: (name) -> get name
        # Do not provice direct class access
        PowerSet: (models, construction) -> new PowerSet(models, construction)
        PowerList: (construction) -> new PowerList(construction)

    }
