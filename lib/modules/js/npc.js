(function() {
  define("npc", ["utilities", "underscore", "backbone"], function(ut) {
    return Backbone.Model.extend({
      defaults: function() {
        return {
          name: "NPC",
          items: [],
          sprite: null,
          frames: {
            left: null,
            right: null,
            up: null,
            down: null
          }
        };
      }
    });
  });

}).call(this);
