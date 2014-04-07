(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "board"], function(globals, utilities, board) {
    var Power, PowerSet, get, getPower, _default, _powers, _ref, _ref1, _useFns;
    _powers = null;
    _default = ["Strike", "Beguile", "Plead"];
    Power = (function(_super) {
      __extends(Power, _super);

      function Power() {
        _ref = Power.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Power.prototype.defaults = {
        creatine: 3,
        power: 1,
        range: 3,
        type: "single",
        name: "Basic",
        uses: Infinity,
        damage: 1,
        modifier: 4,
        action: 'standard'
      };

      Power.prototype.idAttribute = 'name';

      Power.prototype.use = function() {
        this.set("uses", this.get("uses") - 1);
        return this;
      };

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
    _useFns = {
      "Strike": function(target, attacker) {
        target.useCreatine(3);
        return console.log("stole your creatine bro");
      }
    };
    _powers = new PowerSet([
      {
        "name": "Strike",
        "damage": 2,
        "uses": 1,
        "modifier": 4
      }, {
        "name": "Beguile",
        "action": "move",
        "uses": 3
      }, {
        "name": "Plead",
        "action": "minor"
      }
    ]);
    _.each(_powers.models, function(power) {
      var use;
      use = _useFns[power.get("name")];
      if (use) {
        return power.set("use", use);
      }
    });
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
