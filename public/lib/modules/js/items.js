(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "underscore", "backbone"], function(globals, ut) {
    var Inventory, Item, Modifier, ModifierCollection, get, getItem, _items, _ref, _ref1, _ref2, _ref3, _usefns, _wearfns;
    _usefns = {};
    _wearfns = {};
    Modifier = (function(_super) {
      __extends(Modifier, _super);

      function Modifier() {
        _ref = Modifier.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Modifier.prototype.defaults = {
        prop: null,
        mod: 0,
        oneturn: false
      };

      Modifier.prototype.prop = function() {
        return this.get("prop");
      };

      Modifier.prototype.mod = function() {
        return this.get("mod");
      };

      return Modifier;

    })(Backbone.Model);
    ModifierCollection = (function(_super) {
      __extends(ModifierCollection, _super);

      function ModifierCollection() {
        _ref1 = ModifierCollection.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      ModifierCollection.prototype.model = Modifier;

      return ModifierCollection;

    })(Backbone.Collection);
    Item = (function(_super) {
      __extends(Item, _super);

      function Item() {
        _ref2 = Item.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      Item.prototype.idAttribute = 'name';

      Item.prototype.defaults = {
        name: null,
        weight: 1,
        belongsTo: null,
        level: 1,
        role: 1,
        uses: 1,
        equipped: false,
        canUse: true,
        canEquip: false,
        action: 'minor',
        modifiers: new ModifierCollection,
        use: function() {},
        wear: function() {}
      };

      Item.prototype.isNew = function() {
        return true;
      };

      Item.prototype.initialize = function() {
        var _this = this;
        return this.on("change:equipped", function(model, value) {
          if (value === true) {
            return _this.onEquip();
          } else {
            return _this.onUnEquip();
          }
        });
      };

      Item.prototype.isEquipped = function() {
        return this.get("equipped");
      };

      Item.prototype.canEquip = function() {
        return this.get("canEquip");
      };

      Item.prototype.onEquip = function(target) {
        var _ref3;
        if (target == null) {
          target = this.belongsTo();
        }
        if ((_ref3 = this.get("wear")) != null) {
          _ref3.call(this, target);
        }
        target.applyModifiers(this.get("modifiers")).takeAction(this.get("action"));
        return this;
      };

      Item.prototype.onUnEquip = function(target) {
        if (target == null) {
          target = this.belongsTo();
        }
        target.removeModifiers(this.get("modifiers"));
        return this;
      };

      Item.prototype.canUse = function() {
        return this.get("canUse");
      };

      Item.prototype.onUse = function(target) {
        var _ref3;
        if (target == null) {
          target = this.belongsTo();
        }
        if ((_ref3 = this.get("use")) != null) {
          _ref3.call(this, target);
        }
        this.set("uses", this.get("uses") - 1);
        if (this.get("uses") === 0) {
          this.destroy();
        }
        target.applyModifiers(this.get("modifiers")).takeAction(this.get("action"));
        return this;
      };

      Item.prototype.belongsTo = function(model) {
        var belongsTo;
        belongsTo = this.get("belongsTo");
        if (_.isUndefined(model)) {
          return belongsTo;
        } else {
          return _.isEqual(belongsTo, model);
        }
      };

      Item.prototype.parse = function(response) {
        var modifiers,
          _this = this;
        modifiers = new ModifierCollection;
        _.each(response.modifiers, function(mod) {
          return modifiers.add(new Modifier(mod));
        });
        response.modifiers = modifiers;
        return response;
      };

      return Item;

    })(Backbone.Model);
    Inventory = (function(_super) {
      __extends(Inventory, _super);

      function Inventory() {
        _ref3 = Inventory.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      Inventory.prototype.model = Item;

      Inventory.prototype.type = 'Inventory';

      Inventory.prototype.parse = function(resp) {
        _.each(resp, function(item) {
          item.use = _usefns[item.name] || function() {};
          return item.wear = _wearfns[item.name] || function() {};
        });
        return resp;
      };

      Inventory.prototype.comparator = function(model) {
        return -model.get("equipped");
      };

      return Inventory;

    })(Backbone.Collection);
    _items = new Inventory;
    _items.url = "lib/json_packs/items.json";
    _items.fetch({
      success: function(coll, resp) {
        return globals.shared_events.trigger("items_loaded");
      },
      error: function(coll, resp) {
        return console.error(resp);
      },
      parse: true
    });
    getItem = function(name) {
      var item;
      item = _items._byId[name];
      if (_.isObject(item)) {
        return item.clone();
      } else {
        return null;
      }
    };
    get = function(name) {
      var inventory;
      if (typeof name === "string") {
        return getItem(name);
      } else if ($.isArray(name)) {
        inventory = new Inventory;
        _.each(name, function(id) {
          return inventory.add(getItem(id));
        });
        return inventory;
      }
    };
    return window.items = {
      Item: function(construction) {
        return new Item(construction);
      },
      ModifierCollection: ModifierCollection,
      Modifier: Modifier,
      get: function(name) {
        return get(name);
      },
      getDefaultInventory: function(opts) {
        var d,
          _this = this;
        if (opts == null) {
          opts = {};
        }
        d = get(["Tattered Cloak", "Bread"]);
        if (opts.belongsTo && d) {
          _.each(d.models, function(item) {
            return item.set("belongsTo", opts.belongsTo);
          });
        }
        return d;
      }
    };
  });

}).call(this);
