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

    # Model which contains a player's skill levels
    class Skillset extends Backbone.Model
        defaults: ->
            skills = ["alchemy", "cooking", "charisma", "strength", "agility", "toughness", "intelligence"]
            obj = {}
            _.each skills, (skill) ->  obj[skill] = 0
            obj

    class SkillTree extends Backbone.View
        className: 'skill-tree'
        tagName: 'li'
        template: "<canvas height='490' width='580'></canvas>"
        visible: true
        initialize: ->
            @listenTo @model, "show", @show
        render: ->
            @$el.html(_.template @template, _.extend(@model.toJSON(), {skills: @model.get("skills").toJSON()}))
            @
        show: -> 
            @visible = true
            $("li.skill-tree").trigger "hide"
            @$el.fadeIn("fast")
        hide: ->
            @visible = false
            @$el.fadeOut("fast")
        events:
            "hide": "hide"


    # Viewfor choosing which player to level up
    class ChoosePlayer extends Backbone.View
        template: $("#choose-player-for-leveling").html()
        tagName: 'li'
        initialize: ({@leveler}) ->
        render: ->
            @$el.html(_.template @template, @model.toJSON() )
            @
        events:
            click: -> @leveler.focus(@$el.index())


    # The view of all players in the party and their respective skill trees
    class LevelerView extends Backbone.View
        className: 'leveler'
        template: $("#leveler").html()
        render: ->
            @$el.html(_.template @template)
            # @collection.models = _.sortBy @collection.models, (m) -> -m.get("XP")
            _.each @collection.models, (player) =>
                choose_view = new ChoosePlayer({model: player, leveler: @})
                @$(".PC-list").append choose_view.render().el
                skilltree = new SkillTree model: player
                @$(".skill-trees").append skilltree.render().el
            @focus()
            @
        focus: (index=0) ->
            @collection.at(index).trigger("show")
            @
    # Here we define a behavioral class for the NPC.
    # Did not want to subclass the NPC totally, because most of 
    # its behavior is class-independent.
    class Class extends Backbone.Model
        defaults: ->
            default_items: ["Tattered Cloak", "Bread", "Rusted Knife"]
            level: 1
            level_xp_requirements: [null, 100, 500, 1000, 2000, 4000, 80000]
        getDefaultInventory: (opts) ->
            items.get @get("default_items"), opts
        # Accepts a number XP value, and returns if this value is enough for a 
        # new level, given the current level
        isNewLevel: (XP) ->
            level = @get("character").get "level"
            next_XP = @get("level_xp_requirements")[level+1]
            if XP >= next_XP 
                @get("character").set("level", level + 1)
                level + 1
            else false

    class Archer     extends Class
        defaults: ->
            d = super
            default_items = ["Wooden Bow"].concat(d.default_items)
            return _.extend d, {
                default_items: default_items
            }
    class Dragoon    extends Class
        defaults: ->
            d = super
            default_items = ["Iron Lance"].concat(d.default_items)
            return _.extend d, {
                default_items: default_items
            }
    class Fighter    extends Class
        defaults: ->
            d = super
            default_items = ["Rusted Sword"].concat(d.default_items)
            return _.extend d, {
                default_items: default_items
            }
    class Healer     extends Class
        defaults: ->
            d = super
            default_items = ["Phoenix Down", {id: 'Bread', q: 17}].concat(d.default_items)
            return _.extend d, {
                default_items: default_items
            }
    class Knave      extends Class
        defaults: ->
            d = super
            default_items = ["Charming Silks"].concat(d.default_items)
            return _.extend d, {
                default_items: default_items
            }
    class Mage       extends Class
        defaults: ->
            d = super
            default_items = ["Wood Staff"].concat(d.default_items)
            return _.extend d, {
                default_items: default_items
            }
    class Peasant    extends Class
        defaults: ->
            d = super
            default_items = ["Hoe"].concat(d.default_items)
            return _.extend d, {
                default_items: default_items
            }
    class Scholar    extends Class
        defaults: ->
            d = super
            default_items = ["Ink", "Paper"].concat(d.default_items)
            return _.extend d, {
                default_items: default_items
            }
    class Thief      extends Class
        defaults: ->
            d = super
            default_items = ["Iron Dagger"].concat(d.default_items)
            return _.extend d, {
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
        LevelerView: LevelerView
        Skillset: (c,o) -> new Skillset c, o

    }