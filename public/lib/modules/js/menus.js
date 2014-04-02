(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "dialog", "battler", "player", "npc", "board", "underscore", "backbone", "jquery-ui"], function(globals, ut, dialog, battler, player, NPC, board) {
    var BattleMenu, InventoryList, Menu, TravelMenu, closeAll, toggleMenu, _activemenu, _menus, _potential_moves, _ref, _ref1, _ref2;
    board.focus();
    globals.shared_events.on("closemenus", function() {
      return closeAll();
    });
    globals.shared_events.on("openmenu", function() {
      return _activemenu.open();
    });
    InventoryList = items.InventoryList;
    _potential_moves = null;
    Menu = (function(_super) {
      __extends(Menu, _super);

      function Menu() {
        _ref = Menu.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Menu.prototype.type = 'default';

      Menu.prototype.showInventory = function() {
        var list;
        list = new InventoryList({
          collection: this.model.get("inventory")
        });
        list.render();
        return this;
      };

      Menu.prototype.selectThis = function($item) {
        $item.addClass("selected").siblings(".selected").removeClass("selected");
        return this;
      };

      Menu.prototype.selectNext = function() {
        return this.selectThis(this.$el.children(".selected").next());
      };

      Menu.prototype.selectPrev = function() {
        console.log("prev");
        return this.selectThis(this.$el.children(".selected").prev());
      };

      Menu.prototype.events = {
        "click .js-close-menu": function() {
          return toggleMenu(this.type);
        },
        "click .js-show-inventory": function(e) {
          this.showInventory();
          return e.stopPropagation();
        },
        "click li": function(e) {
          return this.selectThis($(e.currentTarget));
        },
        "keyup": function(e) {
          var key;
          key = e.keyCode || e.which;
          switch (key) {
            case 38:
              return this.selectPrev();
            case 40:
              return this.selectNext();
            case 32:
              return this.toggle();
            case 27:
              return this.close();
            case 13:
              return this.$el.children(".selected").trigger("click");
          }
        }
      };

      Menu.prototype.render = function() {
        return this.showInventory();
      };

      Menu.prototype.clickActiveItem = function() {
        return this.$el.children(".selected").trigger("click");
      };

      Menu.prototype.clearPotentialMoves = function() {
        console.log(_potential_moves);
        if (_potential_moves == null) {
          return this;
        }
        return _.each(_potential_moves.models, function(tile) {
          return tile.trigger("removemove");
        });
      };

      Menu.prototype.close = function() {
        var _activemenu;
        _activemenu = null;
        this.showing = false;
        this.$el.effect("slide", _.extend({
          mode: 'hide'
        }, {
          direction: 'right',
          easing: 'easeInOutQuart'
        }), 300);
        board.unpause().focus();
        return this.clearPotentialMoves();
      };

      Menu.prototype.open = function() {
        var active, _activemenu;
        active = battler.getActive({
          player: true
        });
        if (active) {
          this.model = active;
        }
        _activemenu = this;
        this.showing = true;
        this.render();
        board.pause();
        return this.$el.focus().select().effect("slide", _.extend({
          mode: 'show'
        }, {
          direction: 'right',
          easing: 'easeInOutQuart'
        }), 300);
      };

      Menu.prototype.toggle = function() {
        if (this.showing) {
          return this.close();
        } else {
          return this.open();
        }
      };

      return Menu;

    })(Backbone.View);
    TravelMenu = (function(_super) {
      __extends(TravelMenu, _super);

      function TravelMenu() {
        _ref1 = TravelMenu.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      TravelMenu.prototype.el = "#travel-menu";

      TravelMenu.prototype.type = 'travel';

      TravelMenu.prototype.initialize = function() {
        return _.bindAll(this, "close", "open", "toggle", "selectNext", "selectThis", "selectPrev");
      };

      TravelMenu.prototype.render = function() {
        var PC;
        TravelMenu.__super__.render.apply(this, arguments);
        PC = this.model.toJSON();
        return this.$(".HP").text(PC.HP);
      };

      return TravelMenu;

    })(Menu);
    BattleMenu = (function(_super) {
      __extends(BattleMenu, _super);

      function BattleMenu() {
        _ref2 = BattleMenu.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      BattleMenu.prototype.el = "#battle-menu";

      BattleMenu.prototype.type = 'battle';

      BattleMenu.prototype.open = function() {
        BattleMenu.__super__.open.apply(this, arguments);
        return board.unpause();
      };

      BattleMenu.prototype.render = function() {
        return BattleMenu.__super__.render.apply(this, arguments);
      };

      BattleMenu.prototype.initialize = function() {
        _.bindAll(this, "close", "open", "toggle", "selectNext", "selectThis", "selectPrev");
        return this.events = _.extend(this.events, this.child_events);
      };

      BattleMenu.prototype.child_events = {
        "click .js-virtual-move": function() {
          this.clearPotentialMoves();
          _potential_moves = battler.getActive().virtualMovePossibilities();
          return console.log(_potential_moves);
        }
      };

      return BattleMenu;

    })(Menu);
    _menus = window._menus = {
      travel: new TravelMenu({
        model: player.PC
      }),
      battle: new BattleMenu({
        model: battler.getActive({
          player: true
        })
      })
    };
    _activemenu = _menus['battle'];
    toggleMenu = function(menu) {
      var other;
      _activemenu = _menus[menu];
      other = menu === "battle" ? "travel" : "battle";
      _activemenu.toggle();
      _menus[other].close();
      return board.toggleState("MENUOPEN");
    };
    closeAll = function() {
      return _.each(_menus, function(menu) {
        menu.close();
        return board.removeState("MENUOPEN");
      });
    };
    return {
      open: function() {
        _activemenu.open();
        return this;
      },
      close: function() {
        _activemenu.close();
        return this;
      },
      toggleMenu: function(menu) {
        toggleMenu(menu);
        return this;
      },
      selectNext: function() {
        _activemenu.selectNext();
        return this;
      },
      selectPrev: function() {
        _activemenu.selectPrev();
        return this;
      },
      activateMenuItem: function() {
        _activemenu.clickActiveItem();
        return this;
      },
      closeAll: function() {
        closeAll();
        return this;
      },
      battleMenu: _menus["battle"],
      travelMenu: _menus['travel']
    };
  });

}).call(this);
