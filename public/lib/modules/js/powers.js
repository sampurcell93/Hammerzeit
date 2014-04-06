(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "board"], function(globals, utilities, board) {
    var Power, PowerSet, get, getPower, _default, _powers, _ref, _ref1;
    _powers = null;
    _default = ["Strike", "Beguile", "Plead"];
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
        name: "basic",
        uses: Infinity,
        damage: 1,
        action: 'standard'
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

      PowerSet.prototype.url = 'lib/json_packs/attacks.json';

      return PowerSet;

    })(Backbone.Collection);
    _powers = new PowerSet([
      {
        "name": "Strike",
        "damage": 2,
        "uses": 0
      }, {
        "name": "Beguile",
        "action": "move",
        "uses": 3
      }, {
        "name": "Plead",
        "action": "move"
      }
    ]);
    getPower = function(name) {
      var power;
      power = _powers._byId[name];
      if (typeof power === "object") {
        return power.clone();
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
    ({
      getClassDefaults: function(c) {}
    });
    return window.powers = {
      defaultPowers: function(c) {
        var d;
        return d = get(_default);
      },
      get: function(name) {
        return get(name);
      },
      PowerSet: function(models, construction) {
        return new PowerSet(models, construction);
      },
      PowerList: function(construction) {
        return new PowerList(construction);
      }
    };
  });

}).call(this);
