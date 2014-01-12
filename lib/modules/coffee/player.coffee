define "player", ["utilities", "npc", "backbone", "easel", "underscore"], (ut, NPC) ->
	player = NPC.extend
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
			@walkopts = _.extend @getPrivate("walkopts"), {images: ["images/sprites/hero.png"]}
			@sheets = {
				left : new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.left})
				right: new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.right})
				up	 : new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.up})
				down : new createjs.SpriteSheet(_.extend @walkopts, {frames: @frames.down})
			}
			sheet = @sheets.down
			sheet.getAnimation("run").speed = .13
			sheet.getAnimation("run").next = "run"
			sprite = new createjs.Sprite(sheet, "run")
			@marker = sprite

	return {
		model: player
		PC: new player({name: "Hero", items: ["Wooden Sword", "Tattered Cloak"]})
	}