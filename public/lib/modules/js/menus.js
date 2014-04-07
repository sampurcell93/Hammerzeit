(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["powers", "globals", "utilities", "dialog", "battler", "board", "underscore", "backbone", "jquery-ui"], function(powers, globals, ut, dialog, battler, board) {
    var $wrapper, AttributeViewer, InventoryList, Menu, Meter, PowerList, PowerListItem, closeAll, toggleMenu, _activemenu, _menu_slots, _menus, _potential_moves, _ref, _ref1, _ref2, _ref3, _ref4;
    board.focus();
    _menus = [];
    _menu_slots = {
      top: null,
      bottom: null
    };
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
        _.bindAll(this, "rangeHandler", "chooseTargets");
        this.listenTo(this.model, {
          "change:uses": function(model, uses) {
            return this.renderUses(uses);
          }
        });
        return this.listenTo(this.model.ownedBy.actions, "reduce", this.renderDisabled);
      };

      PowerListItem.prototype.render = function() {
        this.$el.html(_.template(this.template, this.model.toJSON()));
        this.renderUses(this.model.get("uses"));
        this.renderDisabled();
        return this;
      };

      PowerListItem.prototype.disable = function() {
        this.$el.addClass("disabled");
        return this;
      };

      PowerListItem.prototype.enable = function() {
        this.$el.removeClass("disabled");
        return this;
      };

      PowerListItem.prototype.renderUses = function(uses) {
        this.$(".uses").text(uses);
        if (uses <= 0) {
          this.disable();
        } else {
          this.enable();
        }
        return this;
      };

      PowerListItem.prototype.renderDisabled = function() {
        console.log("check disabilit");
        if (!(this.model.ownedBy.can(this.model.get("action")))) {
          return this.disable();
        } else {
          return this.enable();
        }
      };

      PowerListItem.prototype.rangeHandler = function(target) {
        target.tileModel.boundPower = this.model;
        return target.tileModel.trigger("attackrange");
      };

      PowerListItem.prototype.chooseTargets = function() {
        var opts, u, user;
        console.log(this.$el);
        if (this.$el.hasClass("disabled")) {
          return this;
        }
        user = this.model.ownedBy;
        if (!user) {
          return;
        }
        opts = {
          diagonal: true,
          ignoreNPCs: true,
          storePath: false,
          ignoreDifficult: true,
          ignoreDeltas: true,
          range: this.model.get("range")
        };
        battler.removeHighlighting();
        battler.setAttacks(u = user.virtualMovePossibilities(null, this.rangeHandler, opts));
        return battler.setState("choosingattacks");
      };

      PowerListItem.prototype.events = {
        "click": "chooseTargets"
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

      Meter.prototype.initialize = function(attrs) {
        var attr, link, max,
          _this = this;
        link = this.link = attrs.el.attr("linker");
        attr = attrs.model.get(link);
        max = attrs.model.get("max_" + link);
        this.setMin(0);
        this.setMax(max);
        this.setOptimum(max);
        this.setHigh(max - max / 4);
        this.setLow(max - (6 * max) / 7);
        this.setDisplay();
        this.$el.attr("value", attr);
        this.listenTo(this.model, "change:" + link, function(model, m) {
          console.log("changing " + link);
          _this.set(m);
          return _this.setDisplay();
        });
        return this.render();
      };

      Meter.prototype.getValue = function() {
        return parseInt(this.$el.attr("value"));
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

      Meter.prototype.setHigh = function(high) {
        this.$el.attr("high", high);
        return this;
      };

      Meter.prototype.setLow = function(low) {
        this.$el.attr("low", low);
        return this;
      };

      Meter.prototype.setOptimum = function(optimum) {
        this.$el.attr("optimum", optimum);
        return this;
      };

      Meter.prototype.setDisplay = function() {
        return this.$el.attr("title", "" + this.link + ": " + (this.model.get(this.link)));
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
        this.set(this.model.get(this.link));
        return this;
      };

      Meter.prototype.events = {
        click: function() {
          return console.log(this.model);
        }
      };

      return Meter;

    })(Backbone.View);
    AttributeViewer = (function(_super) {
      __extends(AttributeViewer, _super);

      function AttributeViewer() {
        _ref3 = AttributeViewer.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      AttributeViewer.prototype.tagName = 'div';

      AttributeViewer.prototype.className = 'attribute-container';

      AttributeViewer.prototype.template = $("#attribute-container").html();

      AttributeViewer.prototype.initialize = function(attrs) {
        var c, h,
          _this = this;
        this.render();
        this.meters = {};
        h = this.meters.health = new Meter({
          el: this.$("meter.HP"),
          model: attrs.model
        });
        c = this.meters.creatine = new Meter({
          el: this.$("meter.creatine"),
          model: attrs.model
        });
        this.listenTo(this.model.actions, "reduce", function(actions) {
          return _this.updateActions(actions);
        });
        return this;
      };

      AttributeViewer.prototype.render = function() {
        return this.$el.html(_.template(this.template, _.extend(this.model.toJSON(), {
          actions: this.model.actions
        })));
      };

      AttributeViewer.prototype.hide = function() {
        var _this = this;
        this.visible = false;
        this.$el.fadeOut("fast");
        _.each(_menu_slots, function(menu, i) {
          if ((menu != null ? menu.id : void 0) === _this.id) {
            return _menu_slots[i] = null;
          }
        });
        return this;
      };

      AttributeViewer.prototype.show = function() {
        var bottom;
        bottom = _menu_slots.bottom != null ? false : true;
        this.visible = true;
        if (bottom === true) {
          this.$el.addClass("bottom");
          _menu_slots.bottom = this;
        } else {
          this.$el.removeClass("bottom");
          _menu_slots.top = this;
        }
        this.$el.fadeIn("fast");
        return this;
      };

      AttributeViewer.prototype.updateActions = function(actions) {
        var _this = this;
        actions = _.pick(this.model.actions, "move", "minor", "standard");
        return _.each(actions, function(val, action) {
          console.log("updating " + action + " with " + val);
          return _this.$("." + action).text(val);
        });
      };

      return AttributeViewer;

    })(Backbone.View);
    Menu = (function(_super) {
      __extends(Menu, _super);

      function Menu() {
        _ref4 = Menu.__super__.constructor.apply(this, arguments);
        return _ref4;
      }

      Menu.prototype.type = 'default';

      Menu.prototype.className = 'game-menu';

      Menu.prototype.template = $("#menu").html();

      Menu.prototype.type = 'battle';

      Menu.prototype.initialize = function() {
        this.setupMeters();
        this.listenTo(this.model, {
          "beginphase": function(phase) {
            return this.$(".phase-number").text(phase + 1);
          }
        });
        _.bindAll(this, "close", "open", "toggle", "selectNext", "selectThis", "selectPrev");
        this.close();
        this.render();
        return this.$el.appendTo($wrapper);
      };

      Menu.prototype.render = function(quadrant) {
        var extras;
        if (quadrant == null) {
          quadrant = this.model.getQuadrant();
        }
        extras = {
          phase: this.model.turnPhase
        };
        this.$el.html(_.template(this.template, _.extend(this.model.toJSON(), extras)));
        if (quadrant) {
          this.$el.attr("quadrant", quadrant);
        }
        this.showPowers();
        return this.showInventory();
      };

      Menu.prototype.setupMeters = function() {
        var container;
        container = this.container = new AttributeViewer({
          model: this.model
        });
        container.$el.appendTo($wrapper);
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
          battler.removeHighlighting();
          _potential_moves = battler.getActive().virtualMovePossibilities();
          battler.setPotentialMoves(_potential_moves);
          return battler.setState("choosingmoves");
        }
      };

      Menu.prototype.clickActiveItem = function() {
        return this.$el.children(".selected").trigger("click");
      };

      Menu.prototype.close = function() {
        this.showing = false;
        this.$el.effect("slide", _.extend({
          mode: 'hide'
        }, {
          direction: 'right',
          easing: 'easeInOutQuart'
        }), 300);
        board.unpause().focus();
        battler.removeHighlighting();
        this.hideAttributeOverlay();
        return this;
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
        $(".attribute-container").hide();
        this.render(quadrant);
        this.showAttributeOverlay();
        this.$el.focus().select().effect("slide", _.extend({
          mode: 'show'
        }, {
          direction: dir,
          easing: 'easeInOutQuart'
        }), 300);
        return this;
      };

      Menu.prototype.toggle = function() {
        if (this.showing) {
          this.close();
        } else {
          this.open();
        }
        return this;
      };

      Menu.prototype.showAttributeOverlay = function() {
        this.container.show();
        return this;
      };

      Menu.prototype.hideAttributeOverlay = function() {
        this.container.hide();
        return this;
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
      },
      m: function() {
        return _menu_slots;
      }
    };
  });

}).call(this);
