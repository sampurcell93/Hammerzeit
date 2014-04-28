(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "board", "items"], function(globals, utilities, board, items) {
    var Modifier, ModifierCollection, Power, PowerSet, get, getPower, _default, _pathopts, _powers, _ref, _ref1, _useFns;
    _powers = null;
    _default = ["Strike", "Arrow", "Whirl"];
    _pathopts = {
      "range": {},
      "burst": {
        diagonal: true
      }
    };
    Modifier = items.Modifier;
    ModifierCollection = items.ModifierCollection;
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
        name: 'Basic',
        uses: Infinity,
        damage: 1,
        damage_die: 4,
        modifiers: new ModifierCollection,
        action: 'standard',
        spread: 'range',
        defense: 'AC',
        belongsTo: null
      };

      Power.prototype.idAttribute = 'name';

      Power.prototype.use = function(subject, opts) {
        var attacker, use;
        if (opts == null) {
          opts = {
            take_action: true
          };
        }
        attacker = this.belongsTo();
        use = this.get("use");
        if (_.isFunction(use)) {
          use.call(this, subject, attacker);
        }
        this.set("uses", this.get("uses") - 1);
        if (this.resolve(attacker, subject) === true) {
          subject.takeDamage(ut.roll(this.get("damage_die")), 1, this.get("damage"));
          attacker.useCreatine(this.get("creatine"));
          subject.applyModifiers(this.get("modifiers"));
        } else {
          subject.drawStatusChange({
            text: 'MISS'
          });
        }
        if (opts.take_action !== false) {
          attacker.takeAction(this.get("action"));
        }
        return this;
      };

      Power.prototype.resolve = function(attacker, subject) {
        var mod;
        if (attacker == null) {
          attacker = this.belongsTo();
        }
        mod = this.get("power") + attacker.get("atk") + ut.roll();
        return mod >= subject.get(this.get("defense"));
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

      Power.prototype.belongsTo = function() {
        return this.get("belongsTo");
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

      PowerSet.prototype.toJSON = function(save) {
        var arr,
          _this = this;
        if (save == null) {
          save = false;
        }
        if (!save) {
          return PowerSet.__super__.toJSON.apply(this, arguments);
        }
        arr = PowerSet.__super__.toJSON.apply(this, arguments);
        _.each(arr, function(power) {
          return power.belongsTo = power.belongsTo.get("id");
        });
        return arr;
      };

      return PowerSet;

    })(Backbone.Collection);
    _useFns = {};
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
        return globals.shared_events.trigger("powers:loaded");
      }
    });
    getPower = function(name, opts) {
      var power;
      if (opts == null) {
        opts = {};
      }
      power = _powers._byId[name];
      if (_.isObject(power)) {
        power = power.clone();
        if (opts.belongsTo) {
          power.set("belongsTo", opts.belongsTo);
        }
        return power;
      } else {
        return null;
      }
    };
    get = function(name, opts) {
      var subset;
      if (opts == null) {
        opts = {};
      }
      if (_.isString(name)) {
        return getPower(name, opts);
      } else if ($.isArray(name)) {
        subset = new PowerSet;
        _.each(name, function(id) {
          var power;
          power = get(id, opts);
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
      getDefaultPowers: function(opts) {
        var d,
          _this = this;
        if (opts == null) {
          opts = {};
        }
        d = get(_default);
        if (opts.belongsTo) {
          _.each(d.models, function(power) {
            return power.set("belongsTo", opts.belongsTo);
          });
        }
        return d;
      },
      get: function(name, opts) {
        if (opts == null) {
          opts = {};
        }
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
