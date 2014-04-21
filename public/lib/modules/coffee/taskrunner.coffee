define ["globals", "utilities", "battler", "board", "player", "controls", "mapper", "mapcreator", "menus"], (globals, ut, battler, board, player, controls, mapper, mapcreator, menus) ->
	window.PC = player.PC

	class User extends Backbone.Model
		url: ->
			if @id then '/user/#{@id}'
			else "/user/"

	class SignUp extends Backbone.View
		template: $("#new-game").html()
		render: ->
			@$el.html _.template @template
			@
		events: ->
			"click .js-start-game": -> 
				user = new User username: 'Sam', password: 'Sampass'
				user.save null, { success: (u, resp) => loadStage(1); ut.destroyModal() }


	loadStage = (module) ->
		board.addState "LOADING"
		# Stage not to be confused with "level": Rename todo
		require ["lib/modules/js/stage" + module], (level) ->
			board.removeState("LOADING")
			PC.on "change:current_chunk", () ->
				ut.c "CHUNK CHANGE REGISTERED IN TASKRUNNER"
				newchunk = PC.get "current_chunk"
				board.setBackground(level.getBackground())
				mapcreator.loadChunk(level.getBitmap()[newchunk.y][newchunk.x], newchunk.x, newchunk.y)
				mapcreator.render()
				full_chunk = level.getBitmap()[newchunk.y][newchunk.x]
				mapper.renderChunk full_chunk, board.getStage()
				battler.clearPotentialMoves()

				

	taskrunner = {
		newGame: () ->
			signup = new SignUp()
			ut.launchModal signup.render().el
		loadStage: (module) -> loadStage module
	}
	globals.shared_events.on "newgame", -> taskrunner.newGame()

	taskrunner