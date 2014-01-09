define "player", ["utilities", "npc", "backbone", "easel"], (ut, NPC) ->
	return NPC.extend 
		frames: {
			# The in place animation frames for the PC
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
		initialize: (attrs) ->
			sheet = new createjs.SpriteSheet
				framerate: 30
				frames: @frames.down
				animations: 
					run: [0,3]
				images: ["images/sprites/hero.png"]
			sheet.getAnimation("run").speed = .13
			sheet.getAnimation("run").next = "run"
			sprite = new createjs.Sprite(sheet, "run")
			@set "marker", sheet
