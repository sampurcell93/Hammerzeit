define ["globals", "utilities", "board", "items", "powers", "mapper", "cast", "underscore", "backbone"], (globals, ut, board, items, powers, mapper, cast) ->

	_ts = globals.map.tileside
	_events = globals.shared_events
	Row = mapper.Row
	ModifierCollection = items.ModifierCollection
	Modifier = items.Modifier

	# Converts left/right/up/down to x y
	coordToDir = (coord, orientation="1") ->
		{"-1x": "left", "1x": "right", "-1y": "up", "1y": "down"}[orientation.toString() + coord]

	_ts = globals.map.tileside

	class NPC extends Backbone.Model
		currentspace: {}
		active: false
		dead: false
		defending: false
		dispatched: false
		# What phase of the user's turn are they at? Max 3
		turnPhase: 0
		type: 'npc'
		colors: {
			"HP": ["#ff0000", "#fff"]
			"AC": ["#ff0000", "#fff"]
			"creatine": ["#ff0000", "blue"]
		}
		walkopts: {
            framerate: 30
            animations: 
                run: [0,3]
            images: ["images/sprites/hero.png"]
        }
        walkspeed: 20
		move_callbacks: 
			done: -> 
			change: ->
		prepareForSave: ->
			attrs = @toJSON()
			a = _.extend attrs, {
				inventory: attrs.inventory.toJSON(true)
				powers: attrs.powers.toJSON(true)
				path: attrs.path.get "name"
				slots: attrs.slots.toJSON(true)
			}
		defaults: ->
			return {
				AC: 10
				atk: 3
				current_chunk: { x: 0, y: 0 }
				currentstage: 1
				creatine: 10
				max_creatine: 10
				HP: 100
				max_HP: 100
				init: 1
				inventory: new items.Inventory
				modifiers: new ModifierCollection()
				statuses: new ModifierCollection()
				jmp: 2
				level: 1
				name: "NPC"
				path: 'peasant'
				powers: powers.PowerSet()
				race: 'human'
				range: 1
				regY: 0
				type: 'npc'
				slots: items.Slots()
				spd: 10
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
		initialize: ({pow, frames, spriteimg, path, inventory} = {}) ->
			unless path instanceof Backbone.Model then @setPath path
			@resetActions()
			@setPowers(pow)
			@setInventory(inventory)
			@listenToOnce globals.shared_events, "items_loaded", =>
				@set("inventory", @get("path").getDefaultInventory({belongsTo: @}))
			@listenToOnce globals.shared_events, "powers_loaded", =>
				@set("powers", pow = powers.getDefaultPowers({belongsTo: @}))
			_.bind @move_callbacks.done, @
			_.bind @move_callbacks.change, @
			@walkopts = _.extend @walkopts, {images: [@get("spriteimg")]}
			@frames = @get("frames")
			@sheets = {
				"-1,0" : new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.left})
				"1,0": new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.right})
				"0,-1": new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.up})
				"0,1" : new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.down})
			}
			@onTurnFunctions = []
			@listenToStatusChanges()
			# Powers load async, so when loaded we need to bind defaults to an unequipped NPC
			# then stop listening
			@createMarker()
			@on "add", (model, coll) => if coll.type is "InitiativeQueue" then @activity_queue = coll
			@cursor()
			@
		# Expects either an array of modifiers (found in items.coffee)
		# or a single modifier. Pass in standard Backbone event options
		# Adds the modifiers to the collection, effectively linking items 
		# to their effects
		applyModifiers: (modifiers, opts={}) ->
			if modifiers instanceof Modifier
				@get("modifiers").add modifiers
				if opts.donetext
					setTimeout =>
						@drawStatusChange text: opts.donetext
					, 1000
			else
				len = modifiers.length
				_.each modifiers.models, (mod, i) => 
					num = i
					if i is 0 then i = 100
					else i = 700*i
					setTimeout =>
						@get("modifiers").add mod, opts
					, i
					if num is len - 1 and opts.donetext
						setTimeout =>
							@drawStatusChange text: opts.donetext
						, 1.6*(i+1)

			
			@
		# Checks if a given target can be occupied. Does not account for entrance vectors, only current state.
		canOccupy: (t) ->
			if t.end is false then return false
			if t.e is "f" then return false
			if t.occupied is true then return false
			true
		clean: ->
			o = _.omit @toJSON(), "creatine", "HP", "max_HP", "max_creatine", "current_chunk", "regY", "spriteimg", "frames"
			o.path = o.path.get("name")
			o
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
		canEquip: (item) =>
			@get("slots").get(item.get("slot")) is null
		canMoveOffChunk: (x, y) -> 
			!(board.hasState("battle")) and board.inBounds(x) and board.inBounds(y)
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
		# Accepts delta params and returns a string for direction. so (1,0) would return "x"
		deltaToString: (dx, dy) ->	
			if dx isnt 0 then "x" else if dy isnt 0 then "y" else ""
		# Draw floating text on this marker
		drawStatusChange: (opts = {}) ->
			defaults = {
				font: "bold 18px Arial"
				color: "#fff"
				text: "!!"
				done: ->
			}
			opts = _.extend defaults, opts
			status = new createjs.Text(opts.text, opts.font, opts.color)
			staus = _.extend status, {shadow: globals.textshadow, y: 20 }
			@marker.addChild status
			d_i = setInterval =>
				status.y -= 2
				if status.y < 0 
					clearInterval d_i
					@marker.removeChild status
					opts.done()
			, 100
			@
		equip: (item, opts={}) ->
			if @canEquip(item)
				item.set("equipped", true, opts)
				@get("slots").set(item.get("slot"), item, opts)
			else @drawStatusChange {text: "#{slot} already equipped!", color: "red"}
			@
		# Pass in a tile DisplayObject, and link it to this NPC
		enterSquare: (target, dx, dy) ->
			target || target = mapper.getTargetTile(0,0,@marker)
			target.tileModel.occupy @
			@currentspace = target
			if target.end is false or target.end is "false" and (dx isnt 0 and dy isnt 0)
				@move(dx, dy, 0);
			@
		getCurrentSpace: -> @currentspace
		getAttrDifference: (key) ->
			@previous(key) - @get(key)
		getChangeModifier: (difference) ->
			if difference < 0 then "+" else "-"
		# Expects an attr key (IE "HP") and the value that it is changing by (IE -2)
		# Returns the color of the display update
		getChangeColor: (attr, value) ->
			value = if value > 0 then 0 else 1
			@colors[attr][value]
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
		# returns if the NPC has an item
		hasItem: (item) ->
			@get("inventory").contains item
		isPC: -> false
		# The square that the NPC was previously in should be cleared when left
		# Should be called in conjunction with "entersquare"
		leaveSquare: ->
			@currentspace.occupied = false
			@currentspace.occupiedBy = null
			@
		# Binds listeners to updates to status (AC, HP, creatine)
		# and draws the corresponding figures on the board
		listenToStatusChanges: ->
			handleChange = (diff, str) =>
				color = @getChangeColor("HP", diff)
				@drawStatusChange (
					{text: @getChangeModifier(diff) + Math.abs(diff) + str, color: color}
				)
			# Bind draw listeners to properties
			_.each ["HP", "creatine", "AC", "atk", "range"], (attr) =>
				@on "change:#{attr}", (model, val) =>
					handleChange @getAttrDifference(attr), attr
			console.log @
			@listenTo @get("modifiers"), 
				"add": (modifier, collection) =>
					currentval = @get modifier.get "prop"
					mod = modifier.get("mod")
					if _.isFunction(mod) 
						newval = mod.call(mod, @, currentval) 
					else 
						newval = currentval + mod
					max = @get("max_#{modifier.get('prop')}")
					if max and newval > max then newval = max
					else if newval < 0 then newval = 0
					@set(modifier.get("prop"), newval)
					if modifier.get("turns")
						@addTurnFunction(_.extend {fn: => @removeModifiers modifier}, modifier.toJSON())
					else if modifier.get("perm") is true
						@removeModifiers modifier, {silent: true}
				"remove": (modifier, collection) =>
					currentval = @get modifier.get "prop"
					@set(modifier.get("prop"), currentval - modifier.get("mod"))

		# Wrapper functions for basic moves
		moveRight: -> @move 1, 0
		moveLeft: -> @move -1, 0
		moveUp: -> @move 0, -1
		moveDown: -> @move 0, 1
		# expects x and inverse-y deltas, IE move(0, 1) would be a downward move by 1 "square"
		# Returns false if the move will not work, or returns the new coords if it does.
		move: (dx, dy, walkspeed) ->
			# if board.hasState("battle") then return false
			if board.isPaused() then return false
			marker = @marker
			target = mapper.getTargetTile dx, dy, @currentspace
			if @moving is true then return false
			sheet = @turn dx, dy
			if !target.tileModel.checkEnterable(dx, dy, null, {character: @}) then return false
			if !@stage or !marker
				throw new Error("There is no stage or marker assigned to this NPC!")
			# if !@canMoveOffChunk() then return false
			@moving = true
			@moveInterval dx, dy
			true
		moveInterval: (dx, dy, walkspeed=@walkspeed) ->
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
			, walkspeed
			true
		obtain: (item, quantity=1) ->
			existing = @hasItem(item)
			if existing 
				quantity += existing.get("quantity")
				item = existing
			item.set("quantity", quantity)
			item.set("belongsTo", @)
			item.set("equipped", false)
			@get("inventory").add item
			@
		# Takes in a dir string and returns the opposite
		oppositeDir: (dir) ->
			if dir is "x" then "y" else if dir is "y" then "x" else ""
		# Removes a specific modifier. Cleanup todo
		removeModifiers: (modifiers=@get("modifiers"), opts={}) ->
			num = 0
			filter = -> true
			if modifiers instanceof Modifier
				@get("modifiers").remove modifiers, opts
				if opts.donetext
					setTimeout =>
						@drawStatusChange text: opts.donetext
					, 1000
			else 
				if opts.type then filter = (model) -> model.get("type") is opts.type
				len = modifiers.length
				_.each modifiers.models, (mod, i) => 
					if filter(mod) is false then return
					num = i
					if i is 0 then i = 100
					else i = 700*i
					setTimeout =>
						@get("modifiers").remove mod, opts
					, i
					if (num is len - 1) and opts.donetext
						setTimeout =>
							console.loh 
							@drawStatusChange text: opts.donetext
						, 1.6*i

			@
		# Reset an animation's properties
		reanimate: (animation, speed, next) ->
			sheet = @marker.icon.spriteSheet
			sheet.getAnimation(animation || "run").speed = speed
			sheet.getAnimation(animation || "run").next = next
		# Takes in a half position (say x= 476, y= 450) and rounds to the nearest 50 (up or down deps on dx,dy)
		# Returns x,y obj
		roundToNearestTile: (x, y, dx, dy) ->
			{x: (Math.ceil(x/_ts)*_ts), y: (Math.ceil(y/_ts)*_ts) }
		# Note the argument order - reflects 2D array notation
		setChunk: (y,x) ->
			chunk = @get "current_chunk"
			chunk.x = x
			chunk.y = y
			@set "current_chunk", chunk, {silent: true}
			@trigger "change:current_chunk"
			@
		setPath: (path="Peasant") ->
			if _.isString(path)
				@set "path", cast.getClassInst(path)
			else if path instanceof Backbone.Model
				return @
			else if _.isObject(path) 
				@set "path", cast.getClassInst(path.name)
			@
		setInventory:(inventory=@get("path").getDefaultInventory({belongsTo: @})) ->
			@removeModifiers null, {type: "Item", silent: true}
			_.each inventory.models, (i) => 
				i.set("belongsTo", @)
				if i.isEquipped()
					i.set("equipped", false, {silent: true})
					@equip i, {silent: true}
			@set "inventory", inventory
			@
		# Expects pixel multiples, IE 500, 700
		setPos: (x,y) ->
			@marker.x = x
			@marker.y = y
			@
		setPowers:(pow=powers.getDefaultPowers({belongsTo: @})) ->
			_.each pow.models, (p) => p.set("belongsTo", @)
			@set "powers", pow
			@
		# Set the sprite sheet to the direction given by the x,y coords. 
		turn: (dx,dy) ->
			x = ut.floorToOne(dx)
			y = ut.floorToOne(dy)
			if x isnt 0 and y isnt 0 then x = 0
			sheet = @sheets[x+","+y]
			if !sheet then alert("FUCKED UP IN TURN")
			@marker.icon.spriteSheet = sheet
		unequip: (item) ->
			if item.isEquipped()
				item.set("equipped", false)
				@get("slots").set(item.get("slot"), null)
			@
		##################################################
		### Battle functions! ###
		##################################################
		# Adds the NPC's marker to the current map at a random valid square
		# Only a temp function for testing
		addTurnFunction: (opts={}) ->
			opts = _.extend {
				timing: 0
				turns: 1
			}, opts
			@onTurnFunctions.push opts
			@
		addToMap: () ->
			chunk = mapper.getVisibleChunk()?.children
			x = Math.abs Math.ceil(Math.random()*globals.map.c_width/_ts - 1)
			y = Math.abs Math.ceil(Math.random()*globals.map.c_height/_ts - 1)
			tile = chunk[y]?.children[x] 
			while @canOccupy(tile) is false
				y++
				x++
				tile = chunk[y = y % (globals.map.tileheight-1)]?.children[x = x % (globals.map.tilewidth-1)]
			@enterSquare tile
			@marker.x = x*_ts
			@marker.y = y*_ts
			board.addMarker @
			@
		# If a user doens't move before the timer runs out, they must burn an action
		# Tries move first, then standard, then minor
		burnAction: ->
			if @takeMove(true) then true
			else if @takeStandard(true) then true
			else if @takeMinor(true) then true
			false
		# accepts a string "move, minor, standard" and returns true if the NPC has actions left for that type
		can: (type)-> @actions[type.toLowerCase()] > 0 
		# Can the user take any more actions?
		canTakeAction: -> @can("minor") or @can("move") or @can("standard")
		# Defend until next turn; burns a move action
		defend: ->
			@applyModifiers(new Modifier({prop: "AC", mod: 2, turns: 1}), {donetext: "Defending!"})
			@addTurnFunction {fn: (=> @defending = false)}
			@defending = true
			@takeMove()
			@
		# Kill NPC
		die: ->
			@dead = true
			@trigger "die", @, @collection, {}
			# alert "You killed #{@get('name')}"
			board.getStage().removeChild @marker
			@leaveSquare()
		# Place the NPC on the dispatcher and let listeners know what to do
		dispatch: (dispatcher) ->
			@dispatched = true
			@setPos(dispatcher.getX(),dispatcher.getY())
			@enterSquare dispatcher.currentspace, 0, 0
			@trigger "dispatch"
			@
		# Resets the NPC's phase counter and alerts all listeners that the turn is done
		endTurn: ->
			@active = false
			@executeTurnFunctions 1
			@turnPhase = 0
			@trigger "turndone"
			@resetActions()
			@
		# Executes all functions in the queue. This is called at the beginning and end of every turn
		# Optional timing variable indicates when the functions are being checked;
		# Functions to be evaluated at the end of a turn will not be evaluated at the beginning.
		executeTurnFunctions: (timing=0) ->
			functions = @onTurnFunctions
			_.each functions, (fun) =>
				if fun.turns > 1 then fun.turns--
				else if fun.timing is timing
					fun.fn()
					fun.markedForDeletion = true
			@onTurnFunctions = _.reject functions, (fun) => fun.markedForDeletion
			@
		# Pass in a color to highlight the current space of the NPC
		highlightTile: (color) ->
			currenttile =  @currentspace
			if !currenttile then return @
			currenttile.tileModel.trigger("generalhighlight", color)
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
			@executeTurnFunctions()
			@indicateActive()
			@active = true
			globals.shared_events.trigger "closemenus"
			@menu.open()
			@nextPhase()
		isActive: -> @active
		isDead: -> @dead
		isDefending: -> @defending
		# Increments the phase counter and sets the game timer according to the 
		# NPC's initiative roll
		nextPhase: ->
			t = @turnPhase
			if t is 3 
				return @endTurn()
			battler.resetTimer().startTimer @i || @get("init"), => 
				@burnAction()
				# @takeMove(
				@nextPhase()
			@trigger "beginphase", @turnPhase
			@turnPhase++
		# Reset turn actions. Can take one standard, one move, one major OR
		# one standard, two minor OR
		# Two moves one minor
		resetActions: ->
			@actions = _.extend {
				standard: 1
				move: 2
				minor: 2
				change: -> 
					@trigger "change", _.pick @, "standard", "move", "minor"
			}, Backbone.Events
			@actions.change()
			@
		# Take a standard action and adjust the other actions.
		takeStandard: (burn) ->
			actions = @actions
			if actions.standard > 0
				actions.standard--
				actions.move--
				actions.change()
			if !burn then @nextPhase()
			else @drawStatusChange {text: 'Burned Action', color: 'red'}  
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
			if !burn then @nextPhase()
			else @drawStatusChange {text: 'Burned Action', color: 'red'} 
			@
		# Take a minor action
		takeMinor: (burn) ->
			actions = @actions
			if actions.minor > 0
				actions.minor--
			if actions.minor is 0
				actions.move--
				actions.change()
			if !burn then @nextPhase()
			else @drawStatusChange {text: 'Burned Action', color: 'red'} 
			@
		takeAction: (type) ->

			actions = ["standard", "minor", "move"]
			if actions.indexOf(type) isnt -1
				@["take" + type.capitalize()]()
			@
		# Subracts from NPC's health. Pass in negative numbers to heal
		takeDamage: (damage) ->
			@applyModifiers(new Modifier({prop: "HP", mod: -damage, perm: true}))
			if @get("HP") <= 0 then @die()
			@
		useCreatine: (creatine) ->
			@applyModifiers(new Modifier({prop: "creatine", mod: -creatine, perm: true}))
			@
		parse: (m) ->
			m.inventory = new items.Inventory(m.inventory, {parse: true})
			m.powers = powers.PowerSet(m.powers, {parse: true})
			m.slots = items.Slots(m.slots)
			m.modifiers = new ModifierCollection m.modifiers, {parse: true}
			m


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
		comparator: (model) -> model.i
		# Returns true if any PCs have been dispatched. Make faster todo
		anyDispatched: -> (_.filter @models, (model) -> model.dispatched is true).length > 0



	# Default view for an NPC - can be launched in a modal or put into any other context.
	class CharacterPropertyView extends Backbone.View
		template: $("#character-view").html()
		render: ->
			@$el.html(_.template @template, @model.toJSON())
			@

	class Enemy extends NPC
		defaults: ->
			defaults = super
			_.extend defaults, {type: 'enemy'}


	# We return the objects directly so we can subclass them :(
	{
		NPC: NPC
		NPCArray: CharacterArray
		Enemy: Enemy
	}