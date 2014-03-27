(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("player", ["utilities", "npc", "board", "globals", "mapper", "backbone", "easel", "underscore"], function(ut, NPC, board, globals, mapper) {
    var player, _ref;
    player = (function(_super) {
      __extends(player, _super);

      function player() {
        _ref = player.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      player.prototype.frames = {
        down: [[0, 0, 55, 55, 0], [55, 0, 55, 55, 0], [110, 0, 55, 55, 0], [165, 0, 55, 55, 0]],
        left: [[0, 55, 55, 55, 0], [55, 55, 55, 55, 0], [110, 55, 55, 55, 0], [165, 55, 55, 55, 0]],
        right: [[0, 110, 55, 55, 0], [55, 110, 55, 55, 0], [110, 110, 55, 55, 0], [165, 110, 55, 55, 0]],
        up: [[0, 165, 55, 55, 0], [55, 165, 55, 55, 0], [110, 165, 55, 55, 0], [165, 165, 55, 55, 0]]
      };

      player.prototype.initialize = function(attrs) {
        var sheet, sprite;
        _.bindAll(this, "contextualize", "insideChunkBounds", "move");
        _.bind(this.move_callbacks.done, this);
        _.bind(this.move_callbacks.change, this);
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

      player.prototype.contextualize = function(x, y) {
        if (x < 0) {
          x += globals.map.width;
        }
        if (y < 0) {
          y += globals.map.height;
        }
        return {
          x: x,
          y: y
        };
      };

      player.prototype.insideChunkBounds = function(chunk) {
        var flag;
        ut.c("before check:", chunk);
        flag = false;
        if (chunk.x < 0) {
          chunk.x = 0;
          flag = true;
        }
        if (chunk.y < 0) {
          chunk.y = 0;
          flag = true;
        }
        return flag;
      };

      player.prototype.move_callbacks = {
        done: function(dx, dy) {
          var chunk, coords, marker, x, y;
          chunk = this.get("current_chunk");
          marker = this.marker;
          _.extend(marker, coords = this.contextualize(marker.x, marker.y));
          x = marker.x;
          y = marker.y;
          if (dx > 0 && (x % globals.map.width) === 0) {
            chunk.x += 1;
          } else if (dx < 0 && x !== 0 && (x % globals.map.c_width) === 0) {
            chunk.x -= 1;
          } else if (dy > 0 && (y % globals.map.height) === 0) {
            chunk.y += 1;
          } else if (dy < 0 && y !== 0 && (y % globals.map.c_height) === 0) {
            chunk.y -= 1;
          } else {
            return {
              x: x,
              y: y
            };
          }
          this.marker.x %= globals.map.width;
          this.marker.y %= globals.map.height;
          this.set("current_chunk", chunk);
          this.trigger("change:current_chunk");
          board.addMarker(this);
          return {
            x: x,
            y: y
          };
        },
        change: function(dx, dy) {}
      };

      player.prototype.move = function(dx, dy) {
        return player.__super__.move.call(this, dx, dy);
      };

      player.prototype.defaults = {
        current_chunk: {
          x: 0,
          y: 0
        },
        type: "PC",
        name: "Hero",
        inventory: ["Wooden Sword", "Tattered Cloak"],
        level: 1,
        attrs: {
          jmp: 2
        }
      };

      return player;

    })(NPC);
    return {
      model: player,
      PC: new player()
    };
  });

}).call(this);
