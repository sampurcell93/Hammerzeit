define ["globals", "utilities", "board", "npc", "player", "mapper", "mapcreator"], (globals, ut, board, NPC, player, mapper, mapcreator) ->
	_user = null
	globals.shared_events.on "newgame", -> newGame()
	globals.shared_events.on "savegame", -> saveGame()


	class User extends Backbone.Model
		idAttribute: '_id'
		url: ->
			if @get("username")
				return '/users/' + @get("username")
			else "/users/"
		parse: (user) ->
			user.party = new player.PCArray(user.party, {parse: true})
			user
		initialize: ->
			@set "party", new player.PCArray([new player.model({path: 'Dragoon'})])
		clean: (pcs=[])->
			j = @toJSON()
			_.each j.party.models, (p) =>
				pcs.push p.prepareForSave()
			_.extend j, {
				party: pcs
			}

	class Loader extends Backbone.View
		template: $("#load-game").html()
		initialize: ({@username}) ->
		render: ->
			@$el.html _.template(@template, {username: @username})
			@
		events: 
			"click .js-start-game": ->
				_user = new User({username: $(".username").val()})
				_user.fetch
					success: -> loadStage 1
					parse: true


	class SignUp extends Backbone.View
		template: $("#new-game").html()
		render: ->
			@$el.html _.template @template
			@
		events: ->
			"click .js-start-game": -> 
				_user = new User username: 'Sams', password: 'Sampass'
				clean = _user.clean()
				_user.save clean, { 
					success: (u, resp) => 
						ut.destroyModal() 
						localStorage.setItem "username", resp.username
						loadStage 1
				}


	loadStage = (module) ->
		board.addState "LOADING"
		# Stage not to be confused with "level": Rename todo
		require ["lib/modules/js/stage" + module], (level) ->
			PC = getPC()
			board.removeState("LOADING")
			PC.on "change:current_chunk", () ->
				ut.c "CHUNK CHANGE REGISTERED IN TASKRUNNER"
				newchunk = PC.get "current_chunk"
				board.setBackground(level.getBackground())
				mapcreator.loadChunk(level.getBitmap()[newchunk.y][newchunk.x], newchunk.x, newchunk.y)
				mapcreator.render()
				full_chunk = level.getBitmap()[newchunk.y][newchunk.x]
				mapper.renderChunk full_chunk, board.getStage()

	loadGame = (id) ->
		loader = new Loader({username: id})
		ut.launchModal loader.render().el
	newGame = ->
		signup = new SignUp()
		ut.launchModal signup.render().el

	saveGame = ->
		_user.save(_user.clean(), success: -> alert("game saved"))
	getPC 	 = -> _user.get("party").at(0)
	getParty = -> _user.get("party")
				

	t = window.taskrunner = {
		newGame: -> newGame()
		loadGame: (userid=null) ->
			if localStorage.getItem "username" 
				loadGame localStorage.getItem("username")
			else loadGame userid
		loadStage: (module) -> loadStage module
		setUser: (key, val) -> _user.set key, val
		getUser: -> _user
		getPC: -> getPC()
		getParty: -> getParty()
	}
