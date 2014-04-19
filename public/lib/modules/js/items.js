(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "underscore", "backbone"], function(globals, ut) {
    var Inventory, Item, get, getItem, _items, _ref, _ref1, _usefns, _wearfns;
    _usefns = {
      "Tattered Cloak": function(t) {
        return t.takeDamage(4);
      },
      "Bread": function(t) {
        return t.takeDamage(4);
      }
    };
    _wearfns = {
      "Tattered Cloak": function(t) {
        return t.set("AC", t.get("AC") + 2);
      }
    };
    Item = (function(_super) {
      __extends(Item, _super);

      function Item() {
        _ref = Item.__super__.constructor.apply(this, arguments);
        return _ref;
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

      Item.prototype.onEquip = function() {
        var _ref1;
        if ((_ref1 = this.get("wear")) != null) {
          _ref1.call(this, this.get("belongsTo"));
        }
        return this;
      };

      Item.prototype.onUnEquip = function() {};

      Item.prototype.canUse = function() {
        return this.get("canUse");
      };

      Item.prototype.onUse = function(target) {
        var _ref1;
        if (target == null) {
          target = this.belongsTo();
        }
        if ((_ref1 = this.get("use")) != null) {
          _ref1.call(this, target);
        }
        this.set("uses", this.get("uses") - 1);
        if (this.get("uses") === 0) {
          this.destroy();
        }
        return this;
      };

      Item.prototype.belongsTo = function() {
        return this.get("belongsTo");
      };

      return Item;

    })(Backbone.Model);
    Inventory = (function(_super) {
      __extends(Inventory, _super);

      function Inventory() {
        _ref1 = Inventory.__super__.constructor.apply(this, arguments);
        return _ref1;
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
