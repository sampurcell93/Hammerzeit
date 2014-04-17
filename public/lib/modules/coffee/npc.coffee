define ["globals", "utilities", "board", "items", "powers", "mapper", "underscore", "backbone"], (globals, ut, board, items, powers, mapper) ->

	_ts = globals.map.tileside
	_events = globals.shared_events
	Row = mapper.Row

	# Converts left/right/up/down to x y
	coordToDir = (coord, orientation) ->
		orientation || orientation = "1"
		orientation = orientation.toString()
		{"-1x": "left", "1x": "right", "-1y": "up", "1y": "down"}[orientation + coord]

	_p = {
		 walkopts: {
            framerate: 30
            animations: 
                run: [0,3]
            images: ["images/sprites/hero.png"]
        }
        walkspeed: 20
	}	
	
	_ts = globals.map.tileside

	class NPC extends Backbone.Model
		currentspace: {}
		active: false
		defaults: ->
			pow = powers.getDefaultPowers()
			_.each pow.models, (power) => power.ownedBy = @
			inventory = items.getDefaultInventory()
			@listenToOnce globals.shared_events, "items_loaded", =>
				@set("inventory", items.getDefaultInventory())
			@listenToOnce globals.shared_events, "powers_loaded", =>
				@set("powers", pow = powers.getDefaultPowers())
				_.each pow.models, (power) => power.ownedBy = @

			return {
				name: "NPC"
				inventory: inventory
				powers: pow
				init: 1
				type: 'npc'
				class: 'peasant'
				creatine: 10
				max_creatine: 10
				race: 'human'
				level: 1
				HP: 10
				max_HP: 10
				spd: 10
				AC: 10
				jmp: 2
				atk: 3
				regY: 10
				# powers: 
				current_chunk: { x: 0, y: 0 }
				spriteimg: "images/sprites/hero.png"
				frames: {
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
			}
		type: 'npc'
		move_callbacks: 
			done: -> 
			change: ->
		initialize: ({frames, spriteimg} = {}) ->
			_.bind @move_callbacks.done, @
			_.bind @move_callbacks.change, @
			@walkopts = _.extend @getPrivate("walkopts"), {images: [@get("spriteimg")]}
			@frames = @get("frames")
			@sheets = {
				"-1,0" : new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.left})
				"1,0": new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.right})
				"0,-1": new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.up})
				"0,1" : new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.down})
			}
			# Powers load async, so when loaded we need to bind defaults to an unequipped NPC
			# then stop listening
			@createMarker()
			@on "add", (model, coll) => if coll.type is "InitiativeQueue" then @activity_queue = coll
			@cursor()
		createMarker: ->
			sheet = @sheets["0,1"]
			sheet.getAnimation("run").speed = .13
			sheet.getAnimation("run").next = "run"
			sprite = new createjs.Sprite(sheet, "run")
			@marker = new createjs.Container()
			@marker.regY =  @get("regY")
			@marker.addChild sprite
			@marker.icon = sprite
			nameobj = new createjs.Text(@get("name"), "14px Arial", "#fff")
			@marker.addChild _.extend nameobj, {shadow: globals.textshadow, y: 40 }
		cursor: -> 
			c = @c || board.newCursor()
			@c = c
			c.hide().move @marker
			c
		# Note the argument order - reflects 2D array notation
		setChunk: (y,x) ->
			chunk = @get "current_chunk"
			chunk.x = x
			chunk.y = y
			@set "current_chunk", chunk, {silent: true}
			@trigger "change:current_chunk"
			@
		# Pass in the tile the NPC will move to - if the diff in elevations exceeds the jump
		# score of the NPC, it is unenterable.
		checkElevation: (target, start) -> 
			start || start = @currentspace
			!(Math.abs(start.elv - target.elv) > @get('jmp'))
		# Takes in a tile DisplayObject (bitmap) and calls a trigger function if it exists
		# Triggers stored in the trigger module
		checkTrigger: (target) ->
			if target.trigger? 
				setTimeout ->
					result = target.trigger()
					# Unless the trigger returns false, destroy it; one time use
					target.trigger = null unless result is false
				, 0
			else null

		canMoveOffChunk: (x, y) -> 
			!(board.hasState("battle")) and board.inBounds(x) and board.inBounds(y)

		# Set the sprite sheet to the direction given by the x,y coords. 
		turn: (dx,dy) ->
			x = ut.floorToOne(dx)
			y = ut.floorToOne(dy)
			if x isnt 0 and y isnt 0 then x = 0
			sheet = @sheets[x+","+y]
			if !sheet then alert("FUCKED UP IN TURN")
			@marker.icon.spriteSheet = sheet
		# The square that the NPC was previously in should be cleared when left
		# Should be called in conjunction with "entersquare"
		leaveSquare: ->
			@currentspace.occupied = false
			@currentspace.occupiedBy = null
			@
		# Pass in a tile DisplayObject, and link it to this NPC
		enterSquare: (target, dx, dy) ->
			@currentspace = target
			target.occupied = true
			target.occupiedBy = @
			if target.end is false or target.end is "false" and (dx isnt 0 and dy isnt 0)
				@move(dx, dy, 0);
		# Wrapper functions for basic moves
		moveRight: -> @move 1, 0
		moveLeft: -> @move -1, 0
		moveUp: -> @move 0, -1
		moveDown: -> @move 0, 1
		# Reset an animation's properties
		reanimate: (animation, speed, next) ->
			sheet = @marker.icon.spriteSheet
			sheet.getAnimation(animation || "run").speed = speed
			sheet.getAnimation(animation || "run").next = next
		# Takes in a half position (say x= 476, y= 450) and rounds to the nearest 50 (up or down deps on dx,dy)
		# Returns x,y obj
		roundToNearestTile: (x, y, dx, dy) ->
			{x: (Math.ceil(x/_ts)*_ts), y: (Math.ceil(y/_ts)*_ts) }
		# Accepts delta params and returns a string for direction. so (1,0) would return "x"
		deltaToString: (dx, dy) ->	
			if dx isnt 0 then "x" else if dy isnt 0 then "y" else ""
		# Takes in a dir string and returns the opposite
		oppositeDir: (dir) ->
			if dir is "x" then "y" else if dir is "y" then "x" else ""
		# expects x and inverse-y deltas, IE move(0, 1) would be a downward move by 1 "square"
		# Returns false if the move will not work, or returns the new coords if it does.
		move: (dx, dy, walkspeed) ->
			# if board.hasState("battle") then return false
			if board.isPaused() then return false
			marker = @marker
			target = mapper.getTargetTile dx, dy, @currentspace
			if @moving is true then return false
			sheet = @turn dx, dy
			if !target.checkEnterable(dx, dy) then return false
			if !@stage or !marker
				throw new Error("There is no stage or marker assigned to this NPC!")
			if !@canMoveOffChunk() then return false
			@moving = true
			@moveInterval dx, dy
			true
		moveInterval: (dx, dy, walkspeed) ->
			@cursor()
			@turn dx, dy
			target = mapper.getTargetTile dx, dy, @currentspace
			count = 0
			cbs = @move_callbacks
			m_i = setInterval =>
				if count < 10
					@marker.x += 5*dx
					@marker.y += 5*dy
					if @c.isVisible() then @c.move @marker
					cbs.change.call(@, dx, dy)
				else 
					clearInterval m_i
					@moving = false
					@checkTrigger target
					do @leaveSquare
					@c.move(@marker).show()
					@enterSquare target, dx, dy
					@reanimate "run", .13, "run"
					@trigger "donemoving"
					cbs.done.call(@, dx, dy)
				count++
			, walkspeed || _p.walkspeed
			true

		### Battle functions! ###
		# Reset turn actions. Can take one standard, one move, one major OR
		# one standard, two minor OR
		# Two moves one minor
		resetActions: ->
			@actions = _.extend @actions, {
				standard: 1
				move: 2
				minor: 2
			}
			@actions.change()
			@
		# Default action values. Can be reset with initTurn or augmented with items
		actions: _.extend {
				standard: 1
				move: 2
				minor: 2
				change: -> 
					@trigger "change", _.pick @, "standard", "move", "minor"
			}, Backbone.Events
		# If a user doens't move before the timer runs out, they must burn an action
		# Tries move first, then standard, then minor
		burnAction: ->
			if @takeMove(true) then true
			else if @takeStandard(true) then true
			else if @takeMinor(true) then true
			false
		# accepts a string "move, minor, standard" and returns true if the NPC has actions left for that type
		can: (type)-> @actions[type.toLowerCase()] > 0 
		# Take a standard action and adjust the other actions.
		takeStandard: (burn) ->
			actions = @actions
			if actions.standard > 0
				actions.standard--
				actions.move--
				actions.change()
			unless burn then @nextPhase()
			@
		# Take a move action
		takeMove: (burn) ->
			actions = @actions
			if actions.move > 0
				actions.move--
			if actions.move is 0
				if actions.standard > 0 then actions.standard--
				actions.minor--
			actions.change()
			unless burn then @nextPhase()
			@
		# Take a minor action
		takeMinor: (burn) ->
			actions = @actions
			if actions.minor > 0
				actions.minor--
			if actions.minor is 0
				actions.move--
				actions.change()
			unless burn then @nextPhase()
			@
		takeAction: (type) ->
			actions = ["standard", "minor", "move"]
			if actions.indexOf(type) isnt -1
				@["take" + type.capitalize()]()
			@
		# Can the user take any more actions?
		canTakeAction: ->
			flag = false
			_.each @actions, (action) -> if action > 0 then flag = true
			flag
		# Defend until next turn; burns a move action
		defend: ->
			@set("AC", @get("AC") + 2)
			@takeMove()
			@
		# Default to not dead
		dead: false
		# Kill NPC
		die: ->
			@dead = true
			@trigger "die", @, @collection, {}
			# alert "You killed #{@get('name')}"
			board.getStage().removeChild @marker
			@leaveSquare()
		# Is the NPC dead?
		isDead: ->
			@dead
		getPrivate: (id) ->
			_p[id]
		getCurrentSpace: -> @currentspace
		# Given pixel x and y coordinates (ie 400, 300), set the current space object
		setCurrentSpace: (target) ->
			target || target = mapper.getTargetTile(0,0,@currentspace)
			# Would use @enterSquare, but throws unexpected errors: todo, debug
			if target 
				@currentspace = target
				target.occupied = true
				target.occupiedBy = @
			target
		# Checks if a given target can be occupied. Does not account for entrance vectors, only current state.
		canOccupy: (t) ->
			if t.end is false then return false
			if t.e is "f" then return false
			if t.occupied is true then return false
			true
		# Adds the NPC's marker to the current map at a random valid square
		# Bug - sometimes t
		addToMap: () ->
			chunk = mapper.getVisibleChunk()?.children
			x = Math.abs Math.ceil(Math.random()*globals.map.c_width/_ts - 1)
			y = Math.abs Math.ceil(Math.random()*globals.map.c_height/_ts - 1)
			tile = chunk[y]?.children[x] 
			while @canOccupy(tile) is false
				y++
				x++
				tile = chunk[y = y % (globals.map.tileheight-1)]?.children[x = x % (globals.map.tilewidth-1)]
			@setCurrentSpace tile
			@enterSquare tile
			console.log "putting #{@get('name')} at #{tile.x},#{tile.y}"
			@marker.x = x*_ts
			@marker.y = y*_ts
			board.addMarker @
			@
		# Pass in a color to highlight the current space of the NPC
		highlightTile: (color) ->
			currenttile =  @currentspace
			if !currenttile then return @
			currenttile.tileModel.trigger("generalhighlight", color)
			@
		# What phase of the user's turn are they at? Max 3
		turnPhase: 0
		# Resets the NPC's phase counter and alerts all listeners that the turn is done
		endTurn: ->
			@active = false
			@turnPhase = 0
			@trigger "turndone"
			@resetActions()
			@
		# Hide every other NPC's personal cursor and show this one
		indicateActive: ->
			_.each @activity_queue.models, (character) -> 
				character.c.hide()
			@c.show().move @marker
			@
		# Begin the NPC's turn by indicating it as the selected,
		# and starting the first phase
		initTurn: ->
			@indicateActive()
			@active = true
			globals.shared_events.trigger "closemenus"
			@menu.open()
			@nextPhase()
		# Increments the phase counter and sets the game timer according to the 
		# NPC's initiative roll
		nextPhase: ->
			t = @turnPhase
			if t is 3 
				return @endTurn()
			battler.resetTimer().startTimer @i || @get("init"), => 
				@burnAction()
				console.log @actions
				# @takeMove(
				@nextPhase()
			@trigger "beginphase", @turnPhase
			@turnPhase++
		# Takes an integer damage value, subtracts it, and renders it to the canvas
		takeDamage: (damage) ->
			if @isDead() then return @
			@set("HP", @get("HP") - damage)
			if @get("HP") <= 0 then @die()
			damage = new createjs.Text(damage + " HP", "bold 18px Arial", "#ff0000")
			damage = _.extend damage, {shadow: globals.textshadow, y: -10 }
			@marker.addChild damage
			d_i = setInterval =>
				damage.y -= 2
				if damage.y < -30 
					clearInterval d_i
					@marker.removeChild damage
			, 100
			@
		useCreatine: (creatine) ->
			current = @get "creatine"
			if current - creatine < 0 then return false
			@set("creatine", current-creatine)
			@
		# Returns the cartesian quadrant of the screen the NPC occupies so that the menu
		# Can make sure not to open over them
		getQuadrant: ->
			x = @marker.x - 3*globals.map.c_width/4
			y = @marker.y - globals.map.c_height/2
			if x < 0 and y < 0 then 2
			else if x <= 0 and y >= 0 then 3
			else if x >= 0 and y <= 0 then 1
			else 4
		getX: -> @marker.x/_ts
		getY: -> @marker.y/_ts
		isActive: -> @active

	# A basic collection of NPCs
	class CharacterArray extends Backbone.Collection
		model: NPC
		type: 'NPCArray'
		getAverageLevel: () ->
			sum = 0
			_.each @models, (PC) =>
				unless PC.isDead()
					sum += PC.get "level"
			Math.ceil sum/@length

	# Default view for an NPC - can be launched in a modal or put into any other context.
	class CharacterPropertyView extends Backbone.View
		template: $("#character-view").html()
		render: ->
			@$el.html(_.template @template, @model.toJSON())
			@

	class Enemy extends NPC
		type: 'enemy'
		defaults: ->
			defaults = super
			console.log defaults
			_.extend defaults, {type: 'enemy'}
	# Bind all the private functions to the public object.... invisibly 0_0
	# _.each move_fns, (fn) ->
		# if typeof fn == "function" then _.bind fn, NPC

	# We return the objects directly so we can subclass them :(
	{
		NPC: NPC
		NPCArray: CharacterArray
		Enemy: Enemy
	}