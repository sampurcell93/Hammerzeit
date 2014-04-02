define ["globals", "utilities", "board", "items", "mapper", "underscore", "backbone"], (globals, ut, board, items, mapper) ->
	_checkEntry = ut.tileEntryCheckers

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
        walkspeed: 9
	}	
	
	_ts = globals.map.tileside

	class NPC extends Backbone.Model
		currentspace: {}
		defaults: ->
			return {
				name: "NPC"
				inventory: new items.Inventory 
				init: 1
				type: 'NPC'
				sprite: null
				level: 1
				HP: 10
				attrs:
					spd: 6
					ac: 10
					jmp: 2
					atk: 3
				# powers: 
				current_chunk: { x: 0, y: 0 }
			}
		type: 'npc'
		move_callbacks: 
			done: -> 
			change: ->
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
		initialize:  ->
			_.bind @move_callbacks.done, @
			_.bind @move_callbacks.change, @
			@walkopts = _.extend @getPrivate("walkopts"), {images: ["images/sprites/hero.png"]}
			@sheets = {
				"-1,0" : new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.left})
				"1,0": new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.right})
				"0,-1": new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.up})
				"0,1" : new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.down})
			}
			sheet = @sheets["0,1"]
			sheet.getAnimation("run").speed = .13
			sheet.getAnimation("run").next = "run"
			sprite = new createjs.Sprite(sheet, "run")
			@marker = sprite
		cursor: board.newCursor()
		showCursor: ->
			sprite.on "click", => 
				@cursor.show().move sprite
				@highlightTile("blue")
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
			!(Math.abs(start.elv - target.elv) > @get("attrs").jmp)
		# Pass in the target tile and the move deltas, and the NPC will use the current 
		# active chunk to determine if the spot is enterable.
		checkEnterable: (target, dx, dy, start)->
			try 
				if !@checkElevation(target, start)
					return false
				if target.e?
					if target.e is false or target.e is "f" then return false
					else if target.occupied is true then return false
					else if typeof target.e is "string"
						return _checkEntry[target.e](dx, dy)
					else true
				else true
			# If the indices do not exist, we're heading to a new chunk.
			catch 
				true
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

		canMoveOffChunk: -> !(board.hasState("battle"))

		# Set the sprite sheet to the direction given by the x,y coords. 
		setSpriteSheet: (dx,dy) ->
			@marker.spriteSheet = @sheets[ut.floorToOne(dx)+","+ut.floorToOne(dy)]
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
			target.occupiedBy = @marker
			if target.end is false or target.end is "false" and (dx isnt 0 and dy isnt 0)
				@move(dx, dy, 0);
		# Wrapper functions for basic moves
		moveRight: -> @move 1, 0
		moveLeft: -> @move -1, 0
		moveUp: -> @move 0, -1
		moveDown: -> @move 0, 1
		# Reset an animation's properties
		reanimate: (animation, speed, next) ->
			sheet = @marker.spriteSheet
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
			if board.getPaused() then return false
			cbs = @move_callbacks
			marker = @marker
			target = @getTargetTile dx, dy
			if @moving is true then return false
			sheet = @setSpriteSheet dx, dy
			if !@checkEnterable(target, dx, dy) then return false
			if !@stage or !marker
				throw new Error("There is no stage or marker assigned to this NPC!")
			if !@canMoveOffChunk() then return false
			count = 0
			@moving = true
			m_i = setInterval =>
				if count < 10
					marker.x += 5*dx
					marker.y += 5*dy
					cbs.change.call(@, dx, dy)
				else 
					clearInterval m_i
					@moving = false
					@checkTrigger target
					do @leaveSquare
					@enterSquare target, dx, dy
					@reanimate "run", .13, "run"
					cbs.done.call(@, dx, dy)
				count++
			, walkspeed || _p.walkspeed
			true

		### Battle functions! ###
		# Reset turn actions. Can take one standard, one move, one major OR
		# one standard, two minor OR
		# Two moves one minor
		initTurn: ->
			@actions = {
				standard: 1
				move: 2
				minor: 2
			}
		# Default action values. Can be reset with initTurn or augmented with items
		actions: {
				standard: 1
				move: 2
				minor: 2
			}
		# Take a standard action and adjust the other actions.
		takeStandard: ->
			actions = @actions
			if actions.standard > 0
				actions.standard--
				actions.move--
				actions.minor--
			@
		# Take a move action
		takeMove: ->
			actions = @actions
			if actions.move > 0
				actions.move--
			@
		# Take a minor action
		takeMinor: ->
			actions = @actions
			if actions.minor > 0
				actions.minor--
		# Can the user take any more actions?
		canTakeAction: ->
			flag = false
			_.each @actions, (action) -> if action > 0 then flag = true
			flag
		# Given move deltas, retrieve the DisplayObject (bitmap) at that position in the current chunk
		getTargetTile: (dx, dy, start) ->
			chunk = mapper.getVisibleChunk()?.children
			y = if start then start.y else @marker.y
			x = if start then start.x else @marker.x
			chunk[(y+(50*dy))/50]?.children[(x+(50*dx))/50] || {}

		# Like move, but lightweight and with no transitions - simple arithmetic check
		# Because we're not updating marker, we can pass in a start object (x:,y:) to be virtualized from
		virtualMove: (dx, dy, start, extra) ->
			extra || extra = 0
			if board.getPaused() then return false
			target = @getTargetTile dx, dy, start
			if _.isEmpty(target) then return false
			if target.tileModel.discovered then return false
			if !@checkEnterable(target, dx, dy, start) then return false
			# If we can't end in the examined sqaure, don't enqueue it -
			# rather, check where the square will take us if we step into it
			# m = target.tileModel.m += extra
			# if target.tileModel.get("end") is false 
				# if dx != 0 then dx*=2 else if dy != 0 then dy *= 2
				# target = @virtualMove(dx, dy, start, extra+1)
				# if target then target.tileModel.distance = m else return false
			target
		# Runs through the currently visible tiles in a battle and determines which moves are possible
		# Returns array of tiles. If true, silent prevents observation 
		# Still inefficient - keeps checking past max distance - todo
		virtualMovePossibilities: (done) ->
			speed      || (speed = @get("attrs").spd)
			start 	   || (start = @getTargetTile 0, 0)
			done	   || (done = (target) -> target.tileModel.trigger("potentialmove"))
			checkQueue = []
			movable = new Row
			checkQueue.unshift(start)
			start.tileModel.discovered = true
			start.tileModel.distance = 0
			# Enqueue a target node
			enqueue = (distance, target) ->
				if !target then return
				d = if target.m then target.m else 1
				if distance + d > speed then return
				else target.tileModel.distance = distance + d
				target.tileModel.discovered = true
				checkQueue.unshift target
				done.call(@, target)

			while checkQueue.length > 0
				square = checkQueue.pop()
				movable.push square.tileModel
				for i in [-1..1]
					if i is 0 then continue
					enqueue(square.tileModel.distance, @virtualMove 0, i, square)
					enqueue(square.tileModel.distance, @virtualMove i, 0, square)

			_.each movable.models, (tile) ->
				tile.discovered = false
			movable
		# Attrs is a sub object, so this saves time
		# May want to remove for security
		setAttrs: (attrs) ->
			current = @get "attrs"
			@set "attrs", _.extend(current, attrs)
		# Default to not dead
		dead: false
		# Kill NPC
		die: ->
			@dead = true
		# Is the NPC dead?
		isDead: ->
			@dead
		getPrivate: (id) ->
			_p[id]
		# Given pixel x and y coordinates (ie 400, 300), set the current space object
		setCurrentSpace: (target) ->
			target || target = @getTargetTile 0, 0
			# Would use @enterSquare, but throws unexpected errors: todo, debug
			if target 
				@currentspace = target
				target.occupied = true
				target.occupiedBy = @marker
			target
		# Checks if a given target can be occupied. Does not account for entrance vectors, only current state.
		canOccupy: (t) ->
			console.log t.end, t.e, t.occupied
			if t.end is false then return false
			if t.e is "f" then return false
			if t.occupied is true then return false
			true
		# Adds the NPC's marker to the current map at a random valid square
		addToMap: () ->
			chunk = mapper.getVisibleChunk()?.children
			x = Math.abs Math.ceil(Math.random()*globals.map.c_width/_ts - 1)
			y = Math.abs Math.ceil(Math.random()*globals.map.c_height/_ts - 1)
			console.log x, y
			tile = chunk[y]?.children[x] 
			while @canOccupy(tile) is false
				tile = chunk[++y]?.children[++x]
			@setCurrentSpace tile
			@marker.x = x*_ts
			@marker.y = y*_ts
			@
		# Pass in a color to highlight the current space of the NPC
		highlightTile: (color) ->
			currenttile =  @currentspace
			if !currenttile then return @
			currenttile.tileModel.trigger("generalhighlight", color)
			@
		# What phase of the user's turn are they at? Max 3
		turnPhase: 0
		initTurn: ->
			@turnPhase = 0
			console.log "starting a character's turn"
			globals.shared_events.trigger "closemenus"
			globals.shared_events.trigger "openmenu"
			battler.resetTimer().startTimer @i
			@listenTo _events, "timerdone", => 
				console.log "the timer is done :("
				@nextPhase()
			console.log "the timer is running!!"
		nextPhase: ->
			t = ++@turnPhase
			console.log t


	class CharacterArray extends Backbone.Collection
		model: NPC
		getAverageLevel: () ->
			sum = 0
			_.each @models, (PC) =>
				unless PC.isDead()
					sum += PC.get "level"
			Math.ceil sum/@length

	# Bind all the private functions to the public object.... invisibly 0_0
	# _.each move_fns, (fn) ->
		# if typeof fn == "function" then _.bind fn, NPC

	# We return the objects directly so we can subclass them
	{
		NPC: NPC
		NPCArray: CharacterArray
	}