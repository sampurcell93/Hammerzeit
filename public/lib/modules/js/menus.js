(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["powers", "globals", "utilities", "dialog", "battler", "board", "underscore", "backbone", "jquery-ui"], function(powers, globals, ut, dialog, battler, board) {
    var $wrapper, InventoryList, Menu, Meter, PowerList, PowerListItem, closeAll, toggleMenu, _activemenu, _menus, _potential_moves, _ref, _ref1, _ref2, _ref3;
    board.focus();
    _menus = [];
    $wrapper = $(".wrapper");
    _activemenu = battler.getActive().menu;
    globals.shared_events.on("closemenus", function() {
      return closeAll();
    });
    globals.shared_events.on("openmenu", function() {
      return _activemenu.open();
    });
    globals.shared_events.on("bindmenu", function(character) {
      _activemenu = character.menu = new Menu({
        model: character
      });
      return _menus.push(_activemenu);
    });
    InventoryList = items.InventoryList;
    PowerList = (function(_super) {
      __extends(PowerList, _super);

      function PowerList() {
        _ref = PowerList.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      PowerList.prototype.tagName = 'ul';

      PowerList.prototype.initialize = function() {
        return _.bindAll(this, "append");
      };

      PowerList.prototype.render = function() {
        this.$el.empty();
        _.each(this.collection.models, this.append);
        return this;
      };

      PowerList.prototype.append = function(power) {
        power = new PowerListItem({
          model: power
        });
        return this.$el.append(power.render().el);
      };

      return PowerList;

    })(Backbone.View);
    PowerListItem = (function(_super) {
      __extends(PowerListItem, _super);

      function PowerListItem() {
        _ref1 = PowerListItem.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      PowerListItem.prototype.tagName = 'li';

      PowerListItem.prototype.className = 'power-item';

      PowerListItem.prototype.template = $("#power-item").html();

      PowerListItem.prototype.initialize = function() {
        _.bindAll(this, "rangeHandler");
        return this.listenTo(this.model, {
          "change:uses": this.renderUses
        });
      };

      PowerListItem.prototype.render = function() {
        this.$el.html(_.template(this.template, this.model.toJSON()));
        return this;
      };

      PowerListItem.prototype.renderUses = function(model, uses) {
        console.log(uses);
        return this.$(".uses").text(uses);
      };

      PowerListItem.prototype.rangeHandler = function(target) {
        target.tileModel.boundPower = this.model;
        return target.tileModel.trigger("attackrange");
      };

      PowerListItem.prototype.events = {
        "click": function() {
          var opts, u, user;
          user = this.model.ownedBy;
          if (!user) {
            return;
          }
          opts = {
            diagonal: true,
            ignoreNPCs: true,
            storePath: false,
            ignoreDifficult: true,
            ignoreDeltas: true
          };
          battler.setAttacks(u = user.virtualMovePossibilities(null, this.rangeHandler, 1, opts));
          return battler.setState("choosingattacks");
        }
      };

      return PowerListItem;

    })(Backbone.View);
    _potential_moves = null;
    Meter = (function(_super) {
      __extends(Meter, _super);

      function Meter() {
        _ref2 = Meter.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      Meter.prototype.tagName = 'meter';

      Meter.prototype.initialize = function(attrs) {
        var attr,
          _this = this;
        attr = attrs.model.get(this.className);
        this.name = attrs.model.get("name");
        this.setMin(0);
        this.setMax(attr);
        this.setOptimal(attr / 2);
        this.listenTo(this.model, "change:" + this.className, function(model, m) {
          return _this.set(m);
        });
        return this.render();
      };

      Meter.prototype.set = function(value) {
        this.$el.attr("value", value);
        return this;
      };

      Meter.prototype.setMin = function(min) {
        this.$el.attr("min", min);
        return this;
      };

      Meter.prototype.setMax = function(max) {
        this.$el.attr("max", max);
        return this;
      };

      Meter.prototype.setOptimal = function(optimal) {
        this.$el.attr("optimal", optimal);
        return this;
      };

      Meter.prototype.hide = function() {
        this.visible = false;
        this.$el.fadeOut("fast");
        return this;
      };

      Meter.prototype.show = function() {
        this.visible = true;
        this.$el.fadeIn("fast");
        return this;
      };

      Meter.prototype.isVisible = function() {
        return this.visible;
      };

      Meter.prototype.render = function() {
        var attr;
        attr = this.model.get(this.className);
        this.$el.attr("display", "" + this.className + ": " + attr);
        this.set(attr);
        return this;
      };

      Meter.prototype.events = {
        click: function() {
          return console.log(this.model);
        }
      };

      return Meter;

    })(Backbone.View);
    Menu = (function(_super) {
      __extends(Menu, _super);

      function Menu() {
        _ref3 = Menu.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      Menu.prototype.type = 'default';

      Menu.prototype.className = 'game-menu';

      Menu.prototype.template = $("#menu").html();

      Menu.prototype.type = 'battle';

      Menu.prototype.initialize = function() {
        this.listenTo(this.model, {
          "beginphase": function(phase) {
            return this.$(".phase-number").text(phase + 1);
          }
        });
        _.bindAll(this, "close", "open", "toggle", "selectNext", "selectThis", "selectPrev");
        this.close();
        this.setupMeters();
        this.render();
        this.renderAttributeOverlays();
        return this.$el.appendTo($wrapper);
      };

      Menu.prototype.render = function(quadrant) {
        if (quadrant == null) {
          quadrant = this.model.getQuadrant();
        }
        this.$el.html(_.template(this.template, _.extend(this.model.toJSON(), {
          phase: this.model.turnPhase
        })));
        if (quadrant) {
          this.$el.attr("quadrant", quadrant);
        }
        this.showPowers();
        return this.showInventory();
      };

      Menu.prototype.setupMeters = function() {
        var c, h;
        this.meters = {};
        h = this.meters.health = new Meter({
          className: 'HP',
          model: this.model
        });
        h.$el.appendTo($wrapper);
        c = this.meters.creatine = new Meter({
          className: 'creatine',
          model: this.model
        });
        c.$el.appendTo($wrapper);
        return this;
      };

      Menu.prototype.showInventory = function() {
        var list;
        list = InventoryList({
          collection: this.model.get("inventory")
        });
        this.$(".inventory-list").html(list.render().el);
        return this;
      };

      Menu.prototype.showPowers = function() {
        var list;
        list = new PowerList({
          collection: this.model.get("powers")
        });
        this.$(".power-list").html(list.render().el);
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
        "click": function() {
          return console.log(this.model.get("name"));
        },
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
        },
        "click .js-virtual-move": function() {
          battler.clearPotentialMoves();
          _potential_moves = battler.getActive().virtualMovePossibilities();
          battler.setPotentialMoves(_potential_moves);
          return battler.setState("choosingmoves");
        }
      };

      Menu.prototype.clickActiveItem = function() {
        return this.$el.children(".selected").trigger("click");
      };

      Menu.prototype.close = function() {
        _activemenu = null;
        this.showing = false;
        this.$el.effect("slide", _.extend({
          mode: 'hide'
        }, {
          direction: 'right',
          easing: 'easeInOutQuart'
        }), 300);
        board.unpause().focus();
        battler.removeHighlighting();
        return _.each(this.meters, function(meter) {
          return meter.hide();
        });
      };

      Menu.prototype.open = function() {
        var active_player, dir, quadrant;
        active_player = battler.getActive();
        battler.setState("menuopen");
        quadrant = this.model.getQuadrant();
        _activemenu = this;
        this.showing = true;
        dir = quadrant === 1 ? "left" : "right";
        $(".game-menu").hide();
        $("meter").hide();
        this.render(quadrant);
        this.renderAttributeOverlays(true);
        return this.$el.focus().select().effect("slide", _.extend({
          mode: 'show'
        }, {
          direction: dir,
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

      Menu.prototype.renderAttributeOverlays = function(show) {
        return _.each(this.meters, function(meter) {
          meter.render();
          if (show === true) {
            console.log(meter.name);
            return meter.show();
          }
        });
      };

      return Menu;

    })(Backbone.View);
    toggleMenu = function() {
      _activemenu.toggle();
      return board.toggleState("MENUOPEN");
    };
    closeAll = function() {
      _.each(_menus, function(menu) {
        return menu.close();
      });
      return board.removeState("MENUOPEN");
    };
    return window.menus = {
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
      Menu: function(construction) {
        return new Menu(construction);
      },
      a: function() {
        return _menus;
      }
    };
  });

}).call(this);
