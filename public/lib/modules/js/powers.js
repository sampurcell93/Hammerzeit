(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "board"], function(globals, utilities, board) {
    var Power, PowerSet, get, getPower, _default, _pathopts, _powers, _ref, _ref1, _useFns;
    _powers = null;
    _default = ["Strike", "Arrow", "Whirl"];
    _pathopts = {
      "range": {},
      "burst": {
        diagonal: true
      }
    };
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
        name: "Basic",
        uses: Infinity,
        damage: 1,
        modifier: 4,
        action: 'standard',
        spread: 'range'
      };

      Power.prototype.idAttribute = 'name';

      Power.prototype.use = function() {
        this.set("uses", this.get("uses") - 1);
        return this;
      };

      Power.prototype.initialize = function() {
        _.bind(this.handlers.range, this);
        return _.bind(this.handlers.burst, this);
      };

      Power.prototype.handlers = {
        range: function(target) {
          target.tileModel.boundPower = this;
          return target.tileModel.trigger("rangeattack");
        },
        burst: function(target) {
          target.tileModel.boundPower = this;
          if (target.tileModel.isOccupied()) {
            return target.tileModel.trigger("burstattack");
          }
        }
      };

      Power.prototype.getHandler = function() {
        return this.handlers[this.get("spread")];
      };

      Power.prototype.getPathOptions = function() {
        return _pathopts[this.get("spread")];
      };

      Power.prototype.getRangeDisplay = function() {
        if (this.get("spread") !== "range") {
          return this.get("spread").charAt(0).toUpperCase() + this.get("range");
        } else {
          return this.get("range");
        }
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

      PowerSet.prototype.type = 'PowerSet';

      PowerSet.prototype.url = 'lib/json_packs/attacks.json';

      return PowerSet;

    })(Backbone.Collection);
    _useFns = {
      "Strike": function(target, attacker) {
        return target.useCreatine(3);
      }
    };
    _powers = new PowerSet;
    _powers.fetch({
      success: function() {
        _.each(_powers.models, function(power) {
          var use;
          use = _useFns[power.get("name")];
          if (use) {
            return power.set("use", use);
          }
        });
        return globals.shared_events.trigger("powers_loaded");
      }
    });
    getPower = function(name) {
      var power;
      power = _powers._byId[name];
      if (_.isObject(power)) {
        return power.clone();
      } else {
        return null;
      }
    };
    get = function(name) {
      var subset;
      if (_.isString(name)) {
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
      getDefaultPowers: function(c) {
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
