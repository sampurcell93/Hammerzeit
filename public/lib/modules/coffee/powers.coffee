define ["globals", "utilities", "board"], (globals, utilities, board) ->
    _powers = null
    _default = ["Strike", "Beguile", "Plead"]

    class Power extends Backbone.Model
        defaults:
            creatine: 0
            power: 1
            range: 1
            type: "single"
            name: "basic"
            uses: Infinity
            damage: 1
            action: 'standard'
        idAttribute: 'name'

    class PowerSet extends Backbone.Collection
        model: Power
        url: 'lib/json_packs/attacks.json'

    _powers = new PowerSet
    _powers.fetch 
        success: ->
            console.log _powers
            globals.shared_events.trigger "powers_loaded"
        parse: true

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
        render: ->
            @$el.html(_.template(@template, @model.toJSON()))
            @
        events: 
            "click": ->
                user = @model.ownedBy
                if !user then return 
                console.log user
                _attackvectors = user.virtualMovePossibilities(null, null, 1)
                console.log _attackvectors


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
