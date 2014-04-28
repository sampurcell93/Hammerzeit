define ["utilities", "globals"], (ut, globals) ->
    _events = globals.shared_events

    class Message extends Backbone.Model
        defaults: ->
            text: "Message!"
    class Messages extends Backbone.Collection
        model: Message

    class Line extends Backbone.View
        tagName: 'li'
        template: "<%= text %>"
        initialize: ->
            @listenTo @model, "destroy": -> @remove()
        render: ->
            @$el.html(_.template(@template, @model.toJSON()))
            @

    class Console extends Backbone.View
        el: '.game-console'
        msgLen: 50
        initialize: ->
            @listenTo @collection, 
                "add": @emit
        trimOldMessages: ->
            if @collection.length > @msgLen
                diff = @collection.length - @msgLen
                to_prune = @collection.slice(0,diff)
                while to_prune.length
                    to_prune.shift().destroy()
            @
        emit: (model) ->
            line = new Line model: model
            $el = @$el
            @$("ol").append(line.render().el)
            $el.animate {scrollTop: $el[0].scrollHeight}, "slow"
            @trimOldMessages()
        events: 
            "click .js-toggle": ->
                @$el.toggleClass("hidden")


    _console = new Console({collection: new Messages})

    handleEvent = (type) ->
        type = type.split(":")
        switch type[0]
            when "state"
                activity.emit "State changed to #{type[1]}"
            when "items"
                activity.emit "Items were #{type[1]}"
            when "powers"
                activity.emit "Powers were #{type[1]}"
            when "menu"
                break;
            when "battle"
                if type[1] is "timerdone"
                    activity.emit "#{arguments[1].get('name')} failed to act, and lost an action"
            when "game"
                activity.emit "Game #{type[1]} loaded"
            else 
                activity.emit type.join(":")

    activity = {
        emit: (message, opts) => _console.collection.add new Message(_.extend {text: message}, opts)
    }

    _events.on "all", handleEvent

    activity
