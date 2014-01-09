(function() {
  define("npc", ["utilities", "underscore", "backbone"], function(ut) {
    return Backbone.Model.extend({
      walkSpeed: 30,
      walkopts: {
        framerate: 30,
        animations: {
          run: [0, 3]
        },
        images: ["images/sprites/hero.png"]
      },
      move: function(dir) {
        var fns, marker, sheet, stage,
          _this = this;
        ut.c(this.moving);
        if (!this.stage || !this.marker || this.moving) {
          return this;
        }
        stage = this.stage;
        marker = this.marker;
        dir = "move" + dir;
        sheet = null;
        fns = {
          moveright: function() {
            var count, moving;
            sheet = marker.spriteSheet = _this.sheets.right;
            count = 0;
            if (!(marker.x >= 650)) {
              moving = setInterval(function() {
                marker.x += 5;
                if (count >= 9) {
                  clearInterval(moving);
                  _this.moving = false;
                }
                return count++;
              }, _this.walkSpeed);
              return true;
            }
            return false;
          },
          moveleft: function() {
            var count, moving;
            sheet = marker.spriteSheet = _this.sheets.left;
            count = 0;
            if (!(marker.x <= 0)) {
              moving = setInterval(function() {
                marker.x -= 5;
                if (count >= 9) {
                  clearInterval(moving);
                  _this.moving = false;
                }
                return count++;
              }, _this.walkSpeed);
              return true;
            }
            return false;
          },
          moveup: function() {
            var count, moving;
            sheet = marker.spriteSheet = _this.sheets.up;
            count = 0;
            if (!(marker.y <= 0)) {
              moving = setInterval(function() {
                marker.y -= 5;
                if (count >= 9) {
                  clearInterval(moving);
                  _this.moving = false;
                }
                return count++;
              }, _this.walkSpeed);
              return true;
            }
            return false;
          },
          movedown: function() {
            var count, moving;
            sheet = marker.spriteSheet = _this.sheets.down;
            if (!(marker.y >= 650)) {
              count = 0;
              moving = setInterval(function() {
                marker.y += 5;
                if (count >= 9) {
                  clearInterval(moving);
                  _this.moving = false;
                }
                return count++;
              }, _this.walkSpeed);
              return true;
            }
            return false;
          }
        };
        if (fns[dir]()) {
          this.moving = true;
        }
        sheet.getAnimation("run").speed = .13;
        sheet.getAnimation("run").next = "run";
        return marker;
      },
      defaults: function() {
        return {
          name: "NPC",
          items: [],
          sprite: null
        };
      },
      frames: {
        left: null,
        right: null,
        up: null,
        down: null
      }
    });
  });

}).call(this);
