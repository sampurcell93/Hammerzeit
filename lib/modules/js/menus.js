(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "dialog", "player", "npc", "underscore", "backbone"], function(globals, ut, dialog, player, NPC) {
    var Menu, _ref;
    Menu = (function(_super) {
      __extends(Menu, _super);

      function Menu() {
        _ref = Menu.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      return Menu;

    })(Backbone.View);
    return {
      toggleBattleMenu: function() {
        return ut.c("launching battle menu");
      },
      toggleTravelMenu: function() {}
    };
  });

}).call(this);
