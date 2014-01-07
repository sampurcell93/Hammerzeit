(function() {
  define("board", ['globals', 'utilities', 'player', 'npc', 'jquery', 'underscore', 'easel'], function(globals, ut, PC, NPC) {
    var board, canvas, giveBg, initialize, scenecount, scenelen, stage, startSlideshow, states;
    canvas = document.getElementById("game-board");
    $.fn.extend({
      changeBg: function(url, options) {
        var num;
        num = this;
        this.css("background", "url(" + url + ") no-repeat");
        return this.css("background-size", "700px 700px");
      }
    });
    states = {
      INACTIVE: 0,
      WAITING: 1
    };
    stage = new createjs.Stage(canvas);
    stage.enableMouseOver(1000);
    board = {
      canvas: canvas,
      $canvas: $(canvas),
      stage: stage,
      ctx: canvas.getContext("2d"),
      state: states.WAITING
    };
    scenecount = 0;
    scenelen = 6;
    giveBg = function() {
      return board.$canvas.attr("bg", "image-" + parseInt(((scenecount++) % scenelen) + 1));
    };
    startSlideshow = function() {
      giveBg();
      return globals.introScenery = setInterval(function() {
        if (scenecount !== 7) {
          return giveBg();
        } else {
          clearInterval(globals.introScenery);
          return globals.introScenery = setInterval(giveBg, 12000);
        }
      }, 1);
    };
    initialize = function() {
      var copyright, loadgame, newgame, textshadow, title;
      startSlideshow();
      textshadow = new createjs.Shadow("#000000", 0, 0, 7);
      title = new createjs.Text(globals.name + " v " + globals.version, "50px Arial", "#f9f9f9");
      _.extend(title, {
        x: 140,
        y: 100,
        shadow: textshadow
      });
      newgame = new createjs.Text("New Game", "30px Arial", "#f9f9f9");
      _.extend(newgame, {
        x: 140,
        y: 280,
        shadow: textshadow,
        cursor: 'pointer',
        mouseEnabled: true
      });
      newgame.addEventListener("click", function() {
        return ut.c("Bout to embark!");
      });
      loadgame = new createjs.Text("Load Game", "30px Arial", "#f9f9f9");
      _.extend(loadgame, {
        x: 380,
        y: 280,
        shadow: textshadow,
        cursor: 'pointer',
        mouseEnabled: true
      });
      ut.addEventListeners(loadgame, {
        "click": function() {
          return ut.c("load, you say?");
        },
        "mouseover": function() {
          return loadgame.color = "white";
        },
        "mouseout": function() {
          return loadgame.font = "30px Arial";
        }
      });
      copyright = new createjs.Text("Game copyright Sam Purcell 2014", "14px Arial", "rgba(255,255,255,.5)");
      _.extend(copyright, {
        x: 10,
        y: 680,
        shadow: textshadow
      });
      board.stage.addChild(newgame, loadgame, title, copyright);
      return board.stage.update();
    };
    initialize();
    return board;
  });

}).call(this);
