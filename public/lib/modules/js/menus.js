(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "dialog", "battler", "player", "npc", "board", "underscore", "backbone", "jquery-ui"], function(globals, ut, dialog, battler, player, NPC, board) {
    var BattleMenu, InventoryList, Menu, TravelMenu, closeAll, toggleMenu, _activemenu, _menus, _ref, _ref1, _ref2;
    InventoryList = items.InventoryList;
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
          if (key === 38) {
            return this.selectPrev();
          } else if (key === 40) {
            return this.selectNext();
          }
        }
      };

      Menu.prototype.render = function() {
        var PC;
        this.showInventory();
        PC = this.model.toJSON();
        return this.$(".HP").text(PC.HP);
      };

      Menu.prototype.clickActiveItem = function() {
        return this.$el.children(".selected").trigger("click");
      };

      Menu.prototype.close = function() {
        console.log(this);
        this.showing = false;
        this.$el.effect("slide", _.extend({
          mode: 'hide'
        }, {
          direction: 'right',
          easing: 'easeInOutQuart'
        }), 300);
        return board.unpause().$canvas.focus();
      };

      Menu.prototype.open = function() {
        var _activemenu;
        _activemenu = this;
        this.showing = true;
        this.render();
        board.pause();
        return this.$el.effect("slide", _.extend({
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

      TravelMenu.prototype.initialize = function() {};

      TravelMenu.prototype.render = function() {
        return TravelMenu.__super__.render.apply(this, arguments);
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
        this.events = _.extend(this.events, this.child_events);
        return console.log(this.events);
      };

      BattleMenu.prototype.child_events = {
        "click .js-virtual-move": function() {
          var p;
          console.clear();
          p = battler.getActivePlayer().virtualMovePossibilities(false);
          return ut.c(p);
        }
      };

      return BattleMenu;

    })(Menu);
    _menus = window._menus = {
      travel: new TravelMenu({
        model: player.PC
      }),
      battle: new BattleMenu({
        model: battler.getActivePlayer()
      })
    };
    _activemenu = _menus['travel'];
    toggleMenu = function(menu) {
      var other;
      other = menu === "battle" ? "travel" : "battle";
      _menus[other].close();
      _menus[menu].toggle();
      return board.toggleState("MENUOPEN");
    };
    closeAll = function() {
      return _.each(_menus, function(menu) {
        menu.close();
        return board.removeState("MENUOPEN");
      });
    };
    return {
      toggleMenu: function(menu) {
        return toggleMenu(menu);
      },
      selectNext: function() {
        return _activemenu.selectNext();
      },
      selectPrev: function() {
        return _activemenu.selectPrev();
      },
      activateMenuItem: function() {
        return _activemenu.clickActiveItem();
      },
      closeAll: function() {
        return closeAll();
      }
    };
  });

}).call(this);
