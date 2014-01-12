(function() {
  define("player", ["utilities", "npc", "backbone", "easel", "underscore"], function(ut, NPC) {
    var player;
    player = NPC.extend({
      frames: {
        down: [[0, 0, 55, 55, 0], [55, 0, 55, 55, 0], [110, 0, 55, 55, 0], [165, 0, 55, 55, 0]],
        left: [[0, 55, 55, 55, 0], [55, 55, 55, 55, 0], [110, 55, 55, 55, 0], [165, 55, 55, 55, 0]],
        right: [[0, 110, 55, 55, 0], [55, 110, 55, 55, 0], [110, 110, 55, 55, 0], [165, 110, 55, 55, 0]],
        up: [[0, 165, 55, 55, 0], [55, 165, 55, 55, 0], [110, 165, 55, 55, 0], [165, 165, 55, 55, 0]]
      },
      initialize: function(attrs) {
        var sheet, sprite;
        this.walkopts = _.extend(this.getPrivate("walkopts"), {
          images: ["images/sprites/hero.png"]
        });
        this.sheets = {
          left: new createjs.SpriteSheet(_.extend(this.walkopts, {
            frames: this.frames.left
          })),
          right: new createjs.SpriteSheet(_.extend(this.walkopts, {
            frames: this.frames.right
          })),
          up: new createjs.SpriteSheet(_.extend(this.walkopts, {
            frames: this.frames.up
          })),
          down: new createjs.SpriteSheet(_.extend(this.walkopts, {
            frames: this.frames.down
          }))
        };
        sheet = this.sheets.down;
        sheet.getAnimation("run").speed = .13;
        sheet.getAnimation("run").next = "run";
        sprite = new createjs.Sprite(sheet, "run");
        return this.marker = sprite;
      }
    });
    return {
      model: player,
      PC: new player({
        name: "Hero",
        items: ["Wooden Sword", "Tattered Cloak"]
      })
    };
  });

}).call(this);
