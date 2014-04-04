(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "board"], function(globals, utilities, board) {
    var Power, PowerList, PowerListItem, PowerSet, get, getPower, _default, _powers, _ref, _ref1, _ref2, _ref3;
    _powers = null;
    _default = null;
    $.getJSON("lib/json_packs/attacks.json", function(powers) {
      _powers = new PowerSet(powers, {
        add: true
      });
      return _default = get(["Power Ball"]);
    });
    Power = (function(_super) {
      __extends(Power, _super);

      function Power() {
        _ref = Power.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Power.prototype.defaults = {
        creatine: 0,
        power: 1,
        range: 1,
        type: "single",
        name: "basic"
      };

      Power.prototype.idAttribute = 'name';

      return Power;

    })(Backbone.Model);
    PowerSet = (function(_super) {
      __extends(PowerSet, _super);

      function PowerSet() {
        _ref1 = PowerSet.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      PowerSet.prototype.model = Power;

      return PowerSet;

    })(Backbone.Collection);
    PowerList = (function(_super) {
      __extends(PowerList, _super);

      function PowerList() {
        _ref2 = PowerList.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      PowerList.prototype.tagName = 'ul';

      PowerList.prototype.render = function() {
        this.$el.empty();
        return _.each(this.collection.models, this.append);
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
        _ref3 = PowerListItem.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      PowerListItem.prototype.tagName = 'li';

      PowerListItem.prototype.render = function() {
        this.$el.html(_.template(this.template, this.model.toJSON()));
        return this;
      };

      return PowerListItem;

    })(Backbone.View);
    getPower = function(name) {
      var power;
      power = _powers._byId[name];
      if (typeof power === "object") {
        return Object.freeze(power);
      } else {
        return null;
      }
    };
    get = function(name) {
      var subset;
      if (typeof name === "string") {
        return getPower(name);
      } else if ($.isArray(name)) {
        subset = new PowerSet;
        _.each(name, function(id) {
          var power;
          power = get(id);
          if (subset.indexOf(power) === -1) {
            return subset.add(power);
          }
        });
        return subset;
      }
    };
    return window.powers = {
      defaultPowers: function() {
        return _default;
      },
      get: function(name) {
        return get(name);
      },
      PowerSet: function(models, construction) {
        return new PowerSet(models, construction);
      }
    };
  });

}).call(this);
