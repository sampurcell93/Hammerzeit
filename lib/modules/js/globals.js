(function() {
  var _this = this;

  define(["underscore", "backbone"], function() {
    var shared_events;
    shared_events = _.extend({}, Backbone.Events);
    return {
      name: 'Hammerzeit!',
      version: 0.1,
      author: "Sam Purcell",
      states: {
        0: "INTRO",
        1: "WAITING",
        2: "BATTLE",
        3: "CUTSCENE",
        4: "TRAVEL",
        5: "DRAWING",
        6: "LOADING"
      },
      map: {
        width: 1000,
        height: 700,
        c_width: 950,
        c_height: 650
      },
      shared_events: shared_events,
      tire_url: "lib/json_packs/tiles.json"
    };
  });

}).call(this);
