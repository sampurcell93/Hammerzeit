(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["utilities", "npc", "board", "globals", "mapper", "items", "powers", "backbone", "easel", "underscore"], function(ut, NPC, board, globals, mapper, items, powers) {
    var PCs, player, stage, _ref;
    stage = board.getStage();
    player = (function(_super) {
      __extends(player, _super);

      function player() {
        _ref = player.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      player.prototype.type = 'player';

      player.prototype.initialize = function(attrs) {
        player.__super__.initialize.apply(this, arguments);
        _.bindAll(this, "contextualize", "insideChunkBounds", "move", "defaults");
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
          var chunk, coords, len, marker, x, y;
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
          len = stage.children.length;
          stage.setChildIndex(marker, 0);
          return {
            x: x,
            y: y
          };
        },
        change: function(dx, dy) {}
      };

      player.prototype.initTurn = function() {
        player.__super__.initTurn.apply(this, arguments);
        console.log("and it's a PC!");
        return globals.shared_events.trigger("openmenu");
      };

      player.prototype.defaults = function() {
        var Item, defaults, inventory,
          _this = this;
        defaults = player.__super__.defaults.apply(this, arguments);
        Item = items.Item;
        inventory = defaults.inventory;
        inventory.add(Item({
          name: 'Wooden Sword'
        }));
        inventory.add(Item({
          name: "Tattered Cloak"
        }));
        inventory.add(Item({
          name: "Bread"
        }));
        inventory.add(Item({
          name: "Worn Boots"
        }));
        inventory.at(2).set("equipped", true);
        _.each(inventory.models, function(item) {
          return item.set("belongsTo", _this);
        });
        inventory.sort();
        return _.extend(defaults, {
          current_chunk: {
            x: 0,
            y: 1
          },
          inventory: inventory,
          type: "PC",
          name: "Hero",
          attrs: {
            spd: 6,
            ac: 10,
            jmp: 2,
            atk: 3
          }
        });
      };

      return player;

    })(NPC.NPC);
    PCs = new NPC.NPCArray;
    PCs.add(new player(null, {
      main: true
    }));
    PCs.add(new player({
      init: 4,
      name: 'Fighter'
    }));
    PCs.add(new player({
      init: 2,
      name: 'Mage'
    }));
    PCs.add(new player({
      init: 3,
      name: 'Cleric'
    }));
    return {
      model: player,
      PC: PCs.at(0),
      PCs: PCs
    };
  });

}).call(this);
