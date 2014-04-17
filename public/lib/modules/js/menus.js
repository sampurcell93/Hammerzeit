(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["powers", "globals", "utilities", "dialog", "battler", "board", "jquery-ui"], function(powers, globals, ut, dialog, battler, board) {
    var $wrapper, CharacterStateDisplay, InventoryList, Menu, Meter, PowerList, PowerListItem, StatList, closeAll, toggleMenu, _activemenu, _menus, _potential_moves, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
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
        _.bindAll(this, "append");
        return this;
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
        _.bindAll(this, "chooseTargets");
        this.listenTo(this.model, {
          "change:uses": function(model, uses) {
            return this.renderUses(uses);
          }
        });
        return this.listenTo(this.model.ownedBy.actions, "change", this.renderDisabled);
      };

      PowerListItem.prototype.render = function() {
        this.$el.html(_.template(this.template, this.model.toJSON()));
        this.renderUses(this.model.get("uses"));
        this.renderDisabled();
        return this;
      };

      PowerListItem.prototype.disable = function() {
        this.disabled = true;
        this.$el.addClass("disabled").removeClass("selected");
        return this;
      };

      PowerListItem.prototype.enable = function() {
        this.disabled = false;
        this.$el.removeClass("disabled");
        return this;
      };

      PowerListItem.prototype.isDisabled = function() {
        return this.disabled;
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
        if (!(this.model.ownedBy.can(this.model.get("action")))) {
          return this.disable();
        } else {
          return this.enable();
        }
      };

      PowerListItem.prototype.chooseTargets = function() {
        var handler, opts, u, user;
        if (this.isDisabled()) {
          return this;
        }
        user = this.model.ownedBy;
        if (!user) {
          return;
        }
        opts = {
          ignoreNPCs: true,
          storePath: false,
          ignoreDifficult: true,
          ignoreDeltas: true,
          range: this.model.get("range")
        };
        opts = _.extend(opts, this.model.getPathOptions());
        battler.removeHighlighting();
        handler = this.model.getHandler();
        battler.setAttacks(u = battler.virtualMovePossibilities(user.getCurrentSpace(), handler, opts));
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

      Meter.prototype.initialize = function(_arg) {
        var attr, el, link, max, model,
          _this = this;
        model = _arg.model, el = _arg.el;
        link = this.link = el.attr("linker");
        attr = model.get(link);
        max = model.get("max_" + link) || attr;
        this.setMin(0);
        this.setMax(max);
        this.setOptimum(max);
        this.setHigh(max - max / 4);
        this.setLow(max - (6 * max) / 7);
        this.setDisplay();
        this.$el.attr("value", attr);
        this.listenTo(this.model, "change:" + link, function(obj, m) {
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
    StatList = (function(_super) {
      __extends(StatList, _super);

      function StatList() {
        _ref3 = StatList.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      StatList.prototype.tagName = 'ul';

      StatList.prototype.className = 'attribute-list';

      StatList.prototype.template = "<li><span class='key'><%= key %>:</span> <%= val %></li>";

      StatList.prototype.objTemplate = "<li><span class='key'><%= key %>:</span> Some stuff</li>";

      StatList.prototype.render = function() {
        var keys, objects,
          _this = this;
        this.$el.empty();
        objects = [];
        keys = Object.keys(this.model).sort();
        _.each(keys, function(key) {
          var val;
          val = _this.model[key];
          key = key.capitalize();
          if (_.isObject(val)) {
            return _this.$el.append(_.template(_this.objTemplate, {
              key: key
            }));
          } else {
            if (_.isString(val)) {
              val = val.capitalize();
            }
            return _this.$el.append(_.template(_this.template, {
              val: val,
              key: key
            }));
          }
        });
        return this;
      };

      return StatList;

    })(Backbone.View);
    CharacterStateDisplay = (function(_super) {
      __extends(CharacterStateDisplay, _super);

      function CharacterStateDisplay() {
        _ref4 = CharacterStateDisplay.__super__.constructor.apply(this, arguments);
        return _ref4;
      }

      CharacterStateDisplay.prototype.tagName = 'div';

      CharacterStateDisplay.prototype.className = 'attribute-container';

      CharacterStateDisplay.prototype.template = $("#attribute-container").html();

      CharacterStateDisplay.prototype.initialize = function(attrs) {
        var c, cleanModel, h,
          _this = this;
        cleanModel = _.omit(this.model.toJSON(), "creatine", "HP", "max_HP", "max_creatine", "current_chunk", "regY", "spriteimg", "frames");
        this.attrlist = new StatList({
          model: cleanModel
        });
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
        this.listenTo(this.model.actions, "change", function(actions) {
          return _this.updateActions(actions);
        });
        return this;
      };

      CharacterStateDisplay.prototype.render = function() {
        this.$el.html(_.template(this.template, _.extend(this.model.toJSON(), {
          actions: this.model.actions
        })));
        return this.$(".full-attributes").html(this.attrlist.render().el);
      };

      CharacterStateDisplay.prototype.hide = function() {
        this.visible = false;
        this.$el.slideUp("fast");
        this.hideFullView();
        return this;
      };

      CharacterStateDisplay.prototype.show = function() {
        this.visible = true;
        if (this.model.isActive() === false) {
          this.$el.addClass("bottom");
        } else {
          this.$el.removeClass("bottom");
        }
        this.$el.slideDown("fast");
        return this;
      };

      CharacterStateDisplay.prototype.updateActions = function(actions) {
        var _this = this;
        actions = _.pick(this.model.actions, "move", "minor", "standard");
        return _.each(actions, function(val, action) {
          return _this.$("." + action).text(val);
        });
      };

      CharacterStateDisplay.prototype.showFullView = function() {
        this.fullViewOpen = true;
        this.$(".js-toggle-full").text("Less");
        this.$(".full-attributes").slideDown("fast");
        return this;
      };

      CharacterStateDisplay.prototype.hideFullView = function() {
        this.fullViewOpen = false;
        this.$(".js-toggle-full").text("More");
        this.$(".full-attributes").slideUp("fast");
        return this;
      };

      CharacterStateDisplay.prototype.toggleFullView = function(e) {
        if (this.fullViewOpen === true) {
          this.hideFullView();
        } else {
          this.showFullView();
        }
        return this;
      };

      CharacterStateDisplay.prototype.events = {
        "click .js-toggle-full": "toggleFullView"
      };

      return CharacterStateDisplay;

    })(Backbone.View);
    Menu = (function(_super) {
      __extends(Menu, _super);

      function Menu() {
        _ref5 = Menu.__super__.constructor.apply(this, arguments);
        return _ref5;
      }

      Menu.prototype.type = 'default';

      Menu.prototype.className = 'game-menu';

      Menu.prototype.template = $("#menu").html();

      Menu.prototype.type = 'battle';

      Menu.prototype.initialize = function() {
        var _this = this;
        this.setupMeters();
        this.listenTo(this.model, {
          "beginphase": function(phase) {
            return this.$(".phase-number").text(phase + 1);
          }
        });
        this.listenTo(this.model.actions, "change", function(actions) {
          return _this.updateActions(actions);
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
        this.showInventory();
        return this.updateActions(this.model.actions);
      };

      Menu.prototype.setupMeters = function() {
        var container;
        container = this.container = new CharacterStateDisplay({
          model: this.model
        });
        container.$el.appendTo($wrapper);
        return this;
      };

      Menu.prototype.updateActions = function(actions) {
        var model;
        model = this.model;
        return this.$el.children("ul").children("li[actiontype]").each(function() {
          var $t, needed;
          $t = $(this);
          needed = $t.attr("actiontype");
          if (!model.can(needed)) {
            return $t.addClass("disabled");
          }
        });
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
          var $t;
          $t = $(e.currentTarget);
          if ($t.hasClass("disabled")) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
            return this;
          }
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
          console.log("specific click");
          battler.removeHighlighting();
          _potential_moves = battler.virtualMovePossibilities(this.model.getCurrentSpace(), null, {
            range: this.model.get("spd")
          });
          battler.setPotentialMoves(_potential_moves);
          return battler.setState("choosingmoves");
        },
        "click .js-defend": function() {
          if (this.model.can("move")) {
            return this.model.defend();
          }
        },
        "click .js-end-turn": function() {
          return this.model.endTurn();
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
      }
    };
  });

}).call(this);
