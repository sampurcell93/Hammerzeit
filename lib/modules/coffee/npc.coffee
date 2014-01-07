define "npc", ["utilities", "underscore", "backbone"], (ut) ->
	return Backbone.Model.extend
		defaults: ->
			name: "NPC"
			items: []
			sprite: null
			frames: {left: null, right: null, up: null, down: null}
