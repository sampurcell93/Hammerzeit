(function() {
  var _this = this;

  define(function() {
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
        width: 700,
        height: 700,
        c_width: 650,
        c_height: 650
      }
    };
  });

}).call(this);
