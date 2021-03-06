(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["utilities", "globals", "items"], function(ut, globals, items) {
    var Archer, ChoosePlayer, Class, Dragoon, Fighter, Healer, Knave, LevelerView, Mage, Peasant, Scholar, SkillTree, Skillset, Thief, test, _classes, _defaultframes, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _spritepath;
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
    Skillset = (function(_super) {
      __extends(Skillset, _super);

      function Skillset() {
        _ref = Skillset.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Skillset.prototype.defaults = function() {
        var obj, skills;
        skills = ["alchemy", "cooking", "charisma", "strength", "agility", "toughness", "intelligence"];
        obj = {};
        _.each(skills, function(skill) {
          return obj[skill] = 0;
        });
        return obj;
      };

      return Skillset;

    })(Backbone.Model);
    SkillTree = (function(_super) {
      __extends(SkillTree, _super);

      function SkillTree() {
        _ref1 = SkillTree.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      SkillTree.prototype.className = 'skill-tree';

      SkillTree.prototype.tagName = 'li';

      SkillTree.prototype.template = "<canvas height='490' width='580'></canvas>";

      SkillTree.prototype.visible = true;

      SkillTree.prototype.initialize = function() {
        return this.listenTo(this.model, "show", this.show);
      };

      SkillTree.prototype.render = function() {
        this.$el.html(_.template(this.template, _.extend(this.model.toJSON(), {
          skills: this.model.get("skills").toJSON()
        })));
        return this;
      };

      SkillTree.prototype.show = function() {
        this.visible = true;
        $("li.skill-tree").trigger("hide");
        return this.$el.fadeIn("fast");
      };

      SkillTree.prototype.hide = function() {
        this.visible = false;
        return this.$el.fadeOut("fast");
      };

      SkillTree.prototype.events = {
        "hide": "hide"
      };

      return SkillTree;

    })(Backbone.View);
    ChoosePlayer = (function(_super) {
      __extends(ChoosePlayer, _super);

      function ChoosePlayer() {
        _ref2 = ChoosePlayer.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      ChoosePlayer.prototype.template = $("#choose-player-for-leveling").html();

      ChoosePlayer.prototype.tagName = 'li';

      ChoosePlayer.prototype.initialize = function(_arg) {
        this.leveler = _arg.leveler;
      };

      ChoosePlayer.prototype.render = function() {
        this.$el.html(_.template(this.template, this.model.toJSON()));
        return this;
      };

      ChoosePlayer.prototype.events = {
        click: function() {
          return this.leveler.focus(this.$el.index());
        }
      };

      return ChoosePlayer;

    })(Backbone.View);
    LevelerView = (function(_super) {
      __extends(LevelerView, _super);

      function LevelerView() {
        _ref3 = LevelerView.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      LevelerView.prototype.className = 'leveler';

      LevelerView.prototype.template = $("#leveler").html();

      LevelerView.prototype.render = function() {
        var _this = this;
        this.$el.html(_.template(this.template));
        _.each(this.collection.models, function(player) {
          var choose_view, skilltree;
          choose_view = new ChoosePlayer({
            model: player,
            leveler: _this
          });
          _this.$(".PC-list").append(choose_view.render().el);
          skilltree = new SkillTree({
            model: player
          });
          return _this.$(".skill-trees").append(skilltree.render().el);
        });
        this.focus();
        return this;
      };

      LevelerView.prototype.focus = function(index) {
        if (index == null) {
          index = 0;
        }
        this.collection.at(index).trigger("show");
        return this;
      };

      return LevelerView;

    })(Backbone.View);
    Class = (function(_super) {
      __extends(Class, _super);

      function Class() {
        _ref4 = Class.__super__.constructor.apply(this, arguments);
        return _ref4;
      }

      Class.prototype.defaults = function() {
        return {
          default_items: ["Tattered Cloak", "Bread", "Rusted Knife"],
          level: 1,
          level_xp_requirements: [null, 100, 500, 1000, 2000, 4000, 80000]
        };
      };

      Class.prototype.getDefaultInventory = function(opts) {
        return items.get(this.get("default_items"), opts);
      };

      Class.prototype.isNewLevel = function(XP) {
        var level, next_XP;
        level = this.get("character").get("level");
        next_XP = this.get("level_xp_requirements")[level + 1];
        if (XP >= next_XP) {
          this.get("character").set("level", level + 1);
          return level + 1;
        } else {
          return false;
        }
      };

      return Class;

    })(Backbone.Model);
    Archer = (function(_super) {
      __extends(Archer, _super);

      function Archer() {
        _ref5 = Archer.__super__.constructor.apply(this, arguments);
        return _ref5;
      }

      Archer.prototype.defaults = function() {
        var d, default_items;
        d = Archer.__super__.defaults.apply(this, arguments);
        default_items = ["Wooden Bow"].concat(d.default_items);
        return _.extend(d, {
          default_items: default_items
        });
      };

      return Archer;

    })(Class);
    Dragoon = (function(_super) {
      __extends(Dragoon, _super);

      function Dragoon() {
        _ref6 = Dragoon.__super__.constructor.apply(this, arguments);
        return _ref6;
      }

      Dragoon.prototype.defaults = function() {
        var d, default_items;
        d = Dragoon.__super__.defaults.apply(this, arguments);
        default_items = ["Iron Lance"].concat(d.default_items);
        return _.extend(d, {
          default_items: default_items
        });
      };

      return Dragoon;

    })(Class);
    Fighter = (function(_super) {
      __extends(Fighter, _super);

      function Fighter() {
        _ref7 = Fighter.__super__.constructor.apply(this, arguments);
        return _ref7;
      }

      Fighter.prototype.defaults = function() {
        var d, default_items;
        d = Fighter.__super__.defaults.apply(this, arguments);
        default_items = ["Rusted Sword"].concat(d.default_items);
        return _.extend(d, {
          default_items: default_items
        });
      };

      return Fighter;

    })(Class);
    Healer = (function(_super) {
      __extends(Healer, _super);

      function Healer() {
        _ref8 = Healer.__super__.constructor.apply(this, arguments);
        return _ref8;
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
        return _.extend(d, {
          default_items: default_items
        });
      };

      return Healer;

    })(Class);
    Knave = (function(_super) {
      __extends(Knave, _super);

      function Knave() {
        _ref9 = Knave.__super__.constructor.apply(this, arguments);
        return _ref9;
      }

      Knave.prototype.defaults = function() {
        var d, default_items;
        d = Knave.__super__.defaults.apply(this, arguments);
        default_items = ["Charming Silks"].concat(d.default_items);
        return _.extend(d, {
          default_items: default_items
        });
      };

      return Knave;

    })(Class);
    Mage = (function(_super) {
      __extends(Mage, _super);

      function Mage() {
        _ref10 = Mage.__super__.constructor.apply(this, arguments);
        return _ref10;
      }

      Mage.prototype.defaults = function() {
        var d, default_items;
        d = Mage.__super__.defaults.apply(this, arguments);
        default_items = ["Wood Staff"].concat(d.default_items);
        return _.extend(d, {
          default_items: default_items
        });
      };

      return Mage;

    })(Class);
    Peasant = (function(_super) {
      __extends(Peasant, _super);

      function Peasant() {
        _ref11 = Peasant.__super__.constructor.apply(this, arguments);
        return _ref11;
      }

      Peasant.prototype.defaults = function() {
        var d, default_items;
        d = Peasant.__super__.defaults.apply(this, arguments);
        default_items = ["Hoe"].concat(d.default_items);
        return _.extend(d, {
          default_items: default_items
        });
      };

      return Peasant;

    })(Class);
    Scholar = (function(_super) {
      __extends(Scholar, _super);

      function Scholar() {
        _ref12 = Scholar.__super__.constructor.apply(this, arguments);
        return _ref12;
      }

      Scholar.prototype.defaults = function() {
        var d, default_items;
        d = Scholar.__super__.defaults.apply(this, arguments);
        default_items = ["Ink", "Paper"].concat(d.default_items);
        return _.extend(d, {
          default_items: default_items
        });
      };

      return Scholar;

    })(Class);
    Thief = (function(_super) {
      __extends(Thief, _super);

      function Thief() {
        _ref13 = Thief.__super__.constructor.apply(this, arguments);
        return _ref13;
      }

      Thief.prototype.defaults = function() {
        var d, default_items;
        d = Thief.__super__.defaults.apply(this, arguments);
        default_items = ["Iron Dagger"].concat(d.default_items);
        return _.extend(d, {
          default_items: default_items
        });
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
      },
      LevelerView: LevelerView,
      Skillset: function(c, o) {
        return new Skillset(c, o);
      }
    };
  });

}).call(this);
