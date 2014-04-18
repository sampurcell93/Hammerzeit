(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "underscore", "backbone"], function(globals, ut) {
    var Inventory, Item, get, getItem, _items, _ref, _ref1, _usefns, _wearfns;
    _usefns = {
      "Tattered Cloak": function(t, l) {}
    };
    _wearfns = {
      "Tattered Cloak": function(t, l) {
        return t.ac += 1;
      }
    };
    Item = (function(_super) {
      __extends(Item, _super);

      function Item() {
        _ref = Item.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Item.prototype.defaults = function() {
        return {
          name: 'Unknown',
          use: function() {
            return console.log(this);
          },
          wear: function() {},
          weight: 1,
          belongsTo: null,
          level: 1,
          role: 1,
          equipped: false
        };
      };

      Item.prototype.idAttribute = 'name';

      Item.prototype.isEquipped = function() {
        return this.get("equipped");
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
        d = get(["Tattered Cloak"]);
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
