(function() {
  define("board", ['utilities', 'player', 'npc', 'jquery', 'underscore', 'easel'], function(ut, PC, NPC, $) {
    var board, canvas, initialize, states;
    canvas = document.getElementById("game-board");
    states = {
      INACTIVE: 0,
      WAITING: 1
    };
    board = {
      canvas: canvas,
      $canvas: $(canvas),
      stage: new createjs.Stage(canvas),
      ctx: canvas.getContext("2d"),
      state: states.WAITING
    };
    initialize = function() {
      var title;
      title = new createjs.Text("Hammerzeit.", "50px Arial", "#f9f9f9");
      _.extend(title, {
        shadow: new createjs.Shadow("#000000", 0, 0, 10)
      });
      board.stage.addChild(title);
      return board.stage.update();
    };
    initialize();
    return board;
  });

}).call(this);
