(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["utilities", "globals", "items"], function(ut, globals, items) {
    var Archer, Class, Dragoon, Fighter, Healer, Knave, Mage, Peasant, Scholar, Thief, test, _classes, _defaultframes, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _spritepath;
    _defaultframes = {
      down: [[0, 0, 55, 55, 0], [55, 0, 55, 55, 0], [110, 0, 55, 55, 0], [165, 0, 55, 55, 0]],
      left: [[0, 55, 55, 55, 0], [55, 55, 55, 55, 0], [110, 55, 55, 55, 0], [165, 55, 55, 55, 0]],
      right: [[0, 110, 55, 55, 0], [55, 110, 55, 55, 0], [110, 110, 55, 55, 0], [165, 110, 55, 55, 0]],
      up: [[0, 165, 55, 55, 0], [55, 165, 55, 55, 0], [110, 165, 55, 55, 0], [165, 165, 55, 55, 0]]
    };
    _spritepath = "images/sprites/";
    test = {
      frames: {
        down: [[0, 0, 50, 80, 0], [50, 0, 50, 80, 0], [100, 0, 50, 80, 0], [150, 0, 50, 80, 0]],
        left: [[0, 55, 55, 55, 0], [55, 55, 55, 55, 0], [110, 55, 55, 55, 0], [165, 55, 55, 55, 0]],
        right: [[0, 110, 55, 55, 0], [55, 110, 55, 55, 0], [110, 110, 55, 55, 0], [165, 110, 55, 55, 0]],
        up: [[0, 165, 55, 55, 0], [55, 165, 55, 55, 0], [110, 165, 55, 55, 0], [165, 165, 55, 55, 0]]
      },
      spriteimg: _spritepath + 'testsheet.png',
      regY: 25
    };
    Class = (function(_super) {
      __extends(Class, _super);

      function Class() {
        _ref = Class.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Class.prototype.defaults = function() {
        return {
          default_items: ["Tattered Cloak", "Bread", "Rusted Knife"]
        };
      };

      Class.prototype.getDefaultInventory = function(opts) {
        return items.get(this.get("default_items"), opts);
      };

      return Class;

    })(Backbone.Model);
    Archer = (function(_super) {
      __extends(Archer, _super);

      function Archer() {
        _ref1 = Archer.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Archer.prototype.defaults = function() {
        var d, default_items;
        d = Archer.__super__.defaults.apply(this, arguments);
        default_items = ["Wooden Bow"].concat(d.default_items);
        return {
          default_items: default_items
        };
      };

      return Archer;

    })(Class);
    Dragoon = (function(_super) {
      __extends(Dragoon, _super);

      function Dragoon() {
        _ref2 = Dragoon.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      Dragoon.prototype.defaults = function() {
        var d, default_items;
        d = Dragoon.__super__.defaults.apply(this, arguments);
        default_items = ["Iron Lance"].concat(d.default_items);
        return {
          default_items: default_items
        };
      };

      return Dragoon;

    })(Class);
    Fighter = (function(_super) {
      __extends(Fighter, _super);

      function Fighter() {
        _ref3 = Fighter.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      Fighter.prototype.defaults = function() {
        var d, default_items;
        d = Fighter.__super__.defaults.apply(this, arguments);
        default_items = ["Rusted Sword"].concat(d.default_items);
        return {
          default_items: default_items
        };
      };

      return Fighter;

    })(Class);
    Healer = (function(_super) {
      __extends(Healer, _super);

      function Healer() {
        _ref4 = Healer.__super__.constructor.apply(this, arguments);
        return _ref4;
      }

      Healer.prototype.defaults = function() {
        var d, default_items;
        d = Healer.__super__.defaults.apply(this, arguments);
        default_items = [
          "Phoenix Down", {
            id: 'Bread',
            q: 17
          }
        ].concat(d.default_items);
        return {
          default_items: default_items
        };
      };

      return Healer;

    })(Class);
    Knave = (function(_super) {
      __extends(Knave, _super);

      function Knave() {
        _ref5 = Knave.__super__.constructor.apply(this, arguments);
        return _ref5;
      }

      Knave.prototype.defaults = function() {
        var d, default_items;
        d = Knave.__super__.defaults.apply(this, arguments);
        default_items = ["Charming Silks"].concat(d.default_items);
        return {
          default_items: default_items
        };
      };

      return Knave;

    })(Class);
    Mage = (function(_super) {
      __extends(Mage, _super);

      function Mage() {
        _ref6 = Mage.__super__.constructor.apply(this, arguments);
        return _ref6;
      }

      Mage.prototype.defaults = function() {
        var d, default_items;
        d = Mage.__super__.defaults.apply(this, arguments);
        default_items = ["Wood Staff"].concat(d.default_items);
        return {
          default_items: default_items
        };
      };

      return Mage;

    })(Class);
    Peasant = (function(_super) {
      __extends(Peasant, _super);

      function Peasant() {
        _ref7 = Peasant.__super__.constructor.apply(this, arguments);
        return _ref7;
      }

      Peasant.prototype.defaults = function() {
        var d, default_items;
        d = Peasant.__super__.defaults.apply(this, arguments);
        default_items = ["Hoe"].concat(d.default_items);
        return {
          default_items: default_items
        };
      };

      return Peasant;

    })(Class);
    Scholar = (function(_super) {
      __extends(Scholar, _super);

      function Scholar() {
        _ref8 = Scholar.__super__.constructor.apply(this, arguments);
        return _ref8;
      }

      Scholar.prototype.defaults = function() {
        var d, default_items;
        d = Scholar.__super__.defaults.apply(this, arguments);
        default_items = ["Ink", "Paper"].concat(d.default_items);
        return {
          default_items: default_items
        };
      };

      return Scholar;

    })(Class);
    Thief = (function(_super) {
      __extends(Thief, _super);

      function Thief() {
        _ref9 = Thief.__super__.constructor.apply(this, arguments);
        return _ref9;
      }

      Thief.prototype.defaults = function() {
        var d, default_items;
        d = Thief.__super__.defaults.apply(this, arguments);
        default_items = ["Iron Dagger"].concat(d.default_items);
        return {
          default_items: default_items
        };
      };

      return Thief;

    })(Class);
    _classes = {
      Archer: Archer,
      Dragoon: Dragoon,
      Fighter: Fighter,
      Healer: Healer,
      Knave: Knave,
      Mage: Mage,
      Peasant: Peasant,
      Scholar: Scholar,
      Thief: Thief
    };
    return window.cast = {
      getPerson: function(name) {
        return test;
      },
      getClassInst: function(classname) {
        if (classname == null) {
          classname = null;
        }
        return new _classes[classname]({
          name: classname
        });
      }
    };
  });

}).call(this);
