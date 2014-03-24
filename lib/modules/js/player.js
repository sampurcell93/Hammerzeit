(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("player", ["utilities", "npc", "board", "globals", "backbone", "easel", "underscore"], function(ut, NPC, board, globals) {
    var player, _ref;
    player = (function(_super) {
      __extends(player, _super);

      function player() {
        _ref = player.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      player.prototype.defaults = {
        current_chunk: {
          x: 0,
          y: 0
        }
      };

      player.prototype.frames = {
        down: [[0, 0, 55, 55, 0], [55, 0, 55, 55, 0], [110, 0, 55, 55, 0], [165, 0, 55, 55, 0]],
        left: [[0, 55, 55, 55, 0], [55, 55, 55, 55, 0], [110, 55, 55, 55, 0], [165, 55, 55, 55, 0]],
        right: [[0, 110, 55, 55, 0], [55, 110, 55, 55, 0], [110, 110, 55, 55, 0], [165, 110, 55, 55, 0]],
        up: [[0, 165, 55, 55, 0], [55, 165, 55, 55, 0], [110, 165, 55, 55, 0], [165, 165, 55, 55, 0]]
      };

      player.prototype.initialize = function(attrs) {
        var sheet, sprite;
        this.walkopts = _.extend(this.getPrivate("walkopts"), {
          images: ["images/sprites/hero.png"]
        });
        this.sheets = {
          "-1,0": new createjs.SpriteSheet(_.extend(this.walkopts, {
            frames: this.frames.left
          })),
          "1,0": new createjs.SpriteSheet(_.extend(this.walkopts, {
            frames: this.frames.right
          })),
          "0,-1": new createjs.SpriteSheet(_.extend(this.walkopts, {
            frames: this.frames.up
          })),
          "0,1": new createjs.SpriteSheet(_.extend(this.walkopts, {
            frames: this.frames.down
          }))
        };
        sheet = this.sheets["0,1"];
        sheet.getAnimation("run").speed = .13;
        sheet.getAnimation("run").next = "run";
        sprite = new createjs.Sprite(sheet, "run");
        this.marker = sprite;
        return this.marker.name = "Player";
      };

      player.prototype.contextualize = function(coords) {
        if (coords.x < 0) {
          coords.x = globals.map.width + coords.x;
        }
        if (coords.y < 0) {
          return coords.y = globals.map.width + coords.y;
        }
      };

      player.prototype.move = function(dx, dy) {
        var chunk, coords, newx, newy;
        coords = player.__super__.move.apply(this, arguments);
        this.contextualize(coords);
        this.marker.x = newx = coords.x;
        this.marker.y = newy = coords.y;
        ut.c(coords);
        chunk = this.get("current_chunk");
        ut.c("checking position");
        if (dx > 0 && (newx % globals.map.width) === 0) {
          chunk.x += 1;
        } else if (dx < 0 && (newx % globals.map.c_width) === 0) {
          chunk.x -= 1;
        } else if (dy > 0 && (newy % globals.map.height) === 0) {
          chunk.y += 1;
        } else if (dy < 0 && (newy % globals.map.c_height) === 0) {
          chunk.y -= 1;
        } else {
          return coords;
        }
        this.marker.x %= globals.map.width;
        this.marker.y %= globals.map.height;
        ut.c("position found to be on a border");
        this.set("current_chunk", chunk);
        this.trigger("change:current_chunk");
        board.addMarker(this);
        return {
          x: this.marker.x,
          y: this.marker.y
        };
      };

      return player;

    })(NPC);
    return {
      model: player,
      PC: new player({
        name: "Hero",
        items: ["Wooden Sword", "Tattered Cloak"]
      })
    };
  });

}).call(this);
