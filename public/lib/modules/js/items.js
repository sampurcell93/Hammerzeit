(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "underscore", "backbone"], function(globals, ut) {
    var Inventory, InventoryList, Item, ItemView, getItem, _items, _ref, _ref1, _ref2, _ref3, _usefns, _wearfns;
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
          use: function() {},
          wear: function() {},
          weight: 1,
          belongsTo: null,
          level: 1,
          role: 1
        };
      };

      Item.prototype.idAttribute = 'name';

      return Item;

    })(Backbone.Model);
    Inventory = (function(_super) {
      __extends(Inventory, _super);

      function Inventory() {
        _ref1 = Inventory.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Inventory.prototype.model = Item;

      Inventory.prototype.parse = function(resp) {
        _.each(resp, function(item) {
          item.use = _usefns[item.name] || function() {};
          return item.wear = _wearfns[item.name] || function() {};
        });
        return resp;
      };

      return Inventory;

    })(Backbone.Collection);
    InventoryList = (function(_super) {
      __extends(InventoryList, _super);

      function InventoryList() {
        _ref2 = InventoryList.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      InventoryList.prototype.el = '.inventory-list';

      InventoryList.prototype.initialize = function() {
        return _.bindAll(this, "render", "addItem");
      };

      InventoryList.prototype.addItem = function(item) {
        item = new ItemView({
          model: item
        });
        return item.render().$el.appendTo(this.$el);
      };

      InventoryList.prototype.render = function() {
        this.$el.empty();
        _.each(this.collection.models, this.addItem);
        return this;
      };

      return InventoryList;

    })(Backbone.View);
    ItemView = (function(_super) {
      __extends(ItemView, _super);

      function ItemView() {
        _ref3 = ItemView.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      ItemView.prototype.tagName = 'li';

      ItemView.prototype.template = $("#inventory-item").html();

      ItemView.prototype.render = function() {
        this.$el.html(_.template(this.template, this.model.toJSON()));
        return this;
      };

      return ItemView;

    })(Backbone.View);
    _items = new Inventory;
    _items.url = "lib/json_packs/items.json";
    _items.fetch({
      success: function(coll, resp) {
        return _items = Object.freeze(coll);
      },
      error: function(coll, resp) {
        return console.error(resp);
      },
      parse: true
    });
    getItem = function(name) {
      var item;
      item = _items._byId[name];
      if (typeof item === "object") {
        return Object.freeze(item);
      } else {
        return null;
      }
    };
    return window.items = {
      Item: Item,
      Inventory: Inventory,
      InventoryList: InventoryList,
      ItemView: ItemView,
      get: function(name) {
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
      }
    };
  });

}).call(this);
