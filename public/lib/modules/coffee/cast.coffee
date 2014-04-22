define ["utilities", "globals", "items"], (ut, globals, items) ->

    _defaultframes = {
        # The in place animation frames for the default NPC
        down: [[0, 0, 55, 55, 0]
                [55, 0, 55, 55, 0]
                [110, 0, 55, 55, 0]
                [165, 0, 55, 55, 0]]
        left: [[0, 55, 55, 55, 0]
            [55, 55, 55, 55, 0]
            [110, 55, 55, 55, 0]
            [165, 55, 55, 55, 0]]
        right: [[0, 110, 55, 55, 0]
            [55, 110, 55, 55, 0]
            [110, 110, 55, 55, 0]
            [165, 110, 55, 55, 0]]
        up: [[0, 165, 55, 55, 0]
            [55, 165, 55, 55, 0]
            [110, 165, 55, 55, 0]
            [165, 165, 55, 55, 0]]
    }
    _spritepath = "images/sprites/"

    # Each person in the cast has a standard json object from which 
    # an NPC class or subclass will be modeled
    test = 
        frames: {
            down: [[0, 0, 50, 80, 0]
                    [50, 0, 50, 80, 0]
                    [100, 0, 50, 80, 0]
                    [150, 0, 50, 80, 0]]
            left: [[0, 55, 55, 55, 0]
                [55, 55, 55, 55, 0]
                [110, 55, 55, 55, 0]
                [165, 55, 55, 55, 0]]
            right: [[0, 110, 55, 55, 0]
                [55, 110, 55, 55, 0]
                [110, 110, 55, 55, 0]
                [165, 110, 55, 55, 0]]
            up: [[0, 165, 55, 55, 0]
                [55, 165, 55, 55, 0]
                [110, 165, 55, 55, 0]
                [165, 165, 55, 55, 0]]
        }
        spriteimg: _spritepath + 'testsheet.png'
        regY: 25

    # Here we define a behavioral class for the NPC.
    # Did not want to subclass the NPC totally, because most of 
    # its behavior is class-independent.
    class Class extends Backbone.Model
        defaults: ->
            default_items: ["Tattered Cloak", "Bread", "Rusted Knife"]
        getDefaultInventory: (opts) ->
            items.get @get("default_items"), opts

    class Archer     extends Class
        defaults: ->
            d = super
            default_items = ["Wooden Bow"].concat(d.default_items)
            return {
                default_items: default_items
            }
    class Dragoon    extends Class
        defaults: ->
            d = super
            default_items = ["Iron Lance"].concat(d.default_items)
            return {
                default_items: default_items
            }
    class Fighter    extends Class
        defaults: ->
            d = super
            default_items = ["Rusted Sword"].concat(d.default_items)
            return {
                default_items: default_items
            }
    class Healer     extends Class
        defaults: ->
            d = super
            default_items = ["Phoenix Down", {id: 'Bread', q: 17}].concat(d.default_items)
            return {
                default_items: default_items
            }
    class Knave      extends Class
        defaults: ->
            d = super
            default_items = ["Charming Silks"].concat(d.default_items)
            return {
                default_items: default_items
            }
    class Mage       extends Class
        defaults: ->
            d = super
            default_items = ["Wood Staff"].concat(d.default_items)
            return {
                default_items: default_items
            }
    class Peasant    extends Class
        defaults: ->
            d = super
            default_items = ["Hoe"].concat(d.default_items)
            return {
                default_items: default_items
            }
    class Scholar    extends Class
        defaults: ->
            d = super
            default_items = ["Ink", "Paper"].concat(d.default_items)
            return {
                default_items: default_items
            }
    class Thief      extends Class
        defaults: ->
            d = super
            default_items = ["Iron Dagger"].concat(d.default_items)
            return {
                default_items: default_items
            }

    _classes = {
        Archer: Archer
        Dragoon: Dragoon
        Fighter: Fighter
        Healer: Healer
        Knave: Knave
        Mage: Mage
        Peasant: Peasant
        Scholar: Scholar
        Thief: Thief
    }

    return window.cast = {
        # Returns the toJSON() object for the person
        getPerson: (name) -> test
        getClassInst: (classname=null) -> new _classes[classname]({name: classname})

    }