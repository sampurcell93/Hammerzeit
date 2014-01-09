define "npc", ["utilities", "underscore", "backbone"], (ut) ->
	return Backbone.Model.extend
		walkSpeed: 30
		walkopts: {
			framerate: 30
			animations: 
				run: [0,3]
			images: ["images/sprites/hero.png"]
		}
		move: (dir) ->
			ut.c @moving
			if !@stage or !@marker or @moving then return @
			stage = @stage
			marker = @marker
			dir = "move" + dir
			sheet = null
			# Private.... slow maybe. Definitely. Optimize.
			fns = {
				moveright: =>
					sheet = marker.spriteSheet = @sheets.right
					count = 0
					unless marker.x >= 650
						moving = setInterval =>
							marker.x += 5
							if count >= 9
								clearInterval moving
								@moving = false
							count++
						, @walkSpeed
						return true
					false
				moveleft: =>
					sheet = marker.spriteSheet = @sheets.left
					count = 0
					unless marker.x <= 0
						moving = setInterval =>
							marker.x -= 5
							if count >= 9
								clearInterval moving
								@moving = false
							count++
						, @walkSpeed
						return true
					false
				moveup: =>
					sheet = marker.spriteSheet = @sheets.up
					count = 0
					unless marker.y <= 0
						moving = setInterval =>
							marker.y -= 5
							if count >= 9
								clearInterval moving
								@moving = false
							count++
						, @walkSpeed
						return true
					false
				movedown: =>
					sheet = marker.spriteSheet = @sheets.down
					unless marker.y >= 650
						count = 0
						moving = setInterval =>
							marker.y += 5
							if count >= 9
								clearInterval moving
								@moving = false
							count++
						, @walkSpeed
						return true
					false
			}
			if fns[dir]() then @moving = true
			# Normalize
			sheet.getAnimation("run").speed = .13
			sheet.getAnimation("run").next = "run"
			marker
		defaults: ->
			name: "NPC"
			items: []
			sprite: null
		frames: {left: null, right: null, up: null, down: null}
