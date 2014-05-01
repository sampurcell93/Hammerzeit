define ["globals", "utilities", "board", "player", "mapper", "mapcreator"], (globals, ut, board, player, mapper, mapcreator) ->
	_user = null
	_currentlevel = 1
	globals.shared_events.on "game:new", -> newGame()
	globals.shared_events.on "game:load", -> loadGame()
	globals.shared_events.on "game:save", -> saveGame()


	class User extends Backbone.Model
		idAttribute: '_id'
		url: ->
			if @get("username")
				return '/users/' + @get("username")
			else "/users/"
		parse: (user) ->
			user.party = new player.PCArray(user.party, {parse: true})
			user
		defaults:
			party: new player.PCArray([
				new player.model({path: 'Dragoon', XP: 200}), 
				new player.model({path: 'Healer', name: 'Jack', HP: 57, XP: 100})
				new player.model({path: 'Fighter', name: 'Braun', HP: 83, XP: 101})
				new player.model({path: 'Thief', name: 'Lidda', HP: 11, max_HP: 20, XP: 300})])
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
					success: -> 
						loadStage 1
						window.PC = _user.get("party").at(0)
						console.log PC
						debugger
						ut.destroyModal()
					parse: true


	class SignUp extends Backbone.View
		template: $("#new-game").html()
		render: ->
			@$el.html _.template @template
			@
		events: ->
			"click .js-start-game": -> 
				_user = new User username: 'Sams', password: 'Sampass'
				# clean = _user.clean()
				# console.log clean
				_user.save _user.clean(), { 
					success: (u, resp) => 
						ut.destroyModal() 
						localStorage.setItem "username", resp.username
						loadStage 1
				}


	loadStage = (module) ->
		board.addState "LOADING"
		# Stage not to be confused with "level": Rename todo
		require ["lib/modules/js/stage" + module], (level) ->
			level.events.on "loading:done", ->
				board.setBackground(level.getBackground())
			_currentlevel = level
			PC = getPC()
			board.removeState("LOADING")
			PC.on "change:current_chunk", (newchunk) ->
				bitmap = level.getPrecursor()
				# mapcreator.loadChunk(level.getBitmap()[newchunk.y][newchunk.x], newchunk.x, newchunk.y)
				# mapcreator.render()
				full_chunk = bitmap[newchunk.y][newchunk.x]
				mapper.mapFromPrecursor full_chunk

	loadGame = (id) ->
		loader = new Loader({username: id})
		ut.launchModal loader.render().el, {isolate: true}
	newGame = ->
		signup = new SignUp()
		ut.launchModal signup.render().el, {isolate: true}

	saveGame = ->
		savedparty = _user.get("party")
		_user.save(_user.clean(), 
			success: -> 
				_user.set "party", savedparty
				alert("game saved")
		)
	getParty  = -> _user.get("party")
	getPlayer = (index) -> getParty().at index
	getPC 	  = -> getPlayer 0
				
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
		getPlayerAt: (index) -> getPlayer index
	}
