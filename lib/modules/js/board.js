(function() {
  define(['globals', 'utilities', 'player', 'npc', 'jquery', 'underscore', 'easel'], function(globals, ut, PC, NPC) {
    var $canvas, canvas, clear, giveBg, initialize, keysDisabled, newGame, scenecount, scenelen, setState, stage, startSlideshow, state, states, taskrunner, textshadow, ticker;
    canvas = document.getElementById("game-board");
    $canvas = $(canvas);
    globals.states = states = {
      INTRO: 0,
      WAITING: 1,
      BATTLE: 2,
      CUTSCENE: 3,
      TRAVEL: 4,
      DRAWING: 5
    };
    stage = new createjs.Stage(canvas);
    stage.enableMouseOver(1000);
    ticker = createjs.Ticker;
    ticker.addEventListener("tick", function(tick) {
      if (!tick.paused) {
        return stage.update();
      }
    });
    state = states.INTRO;
    taskrunner = null;
    keysDisabled = false;
    textshadow = globals.textshadow = new createjs.Shadow("#000000", 0, 0, 7);
    scenecount = 0;
    scenelen = 6;
    giveBg = function(count) {
      if (count === -1) {
        return $canvas.attr("bg", "image-none");
      } else {
        return $canvas.attr("bg", "image-" + parseInt(((count || scenecount++) % scenelen) + 1));
      }
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
      }, 0);
    };
    newGame = function() {
      ut.c("About to embark!");
      return taskrunner.loadStage(1);
    };
    initialize = function(runner) {
      var copyright, loadgame, newgame, title;
      taskrunner = runner;
      startSlideshow();
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
      newgame.addEventListener("click", newGame);
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
          return loadgame.font = "bold 30px Arial";
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
      stage.addChild(newgame, loadgame, title, copyright);
      return ut.c(stage.getChildIndex(copyright));
    };
    clear = function() {
      stage.removeAllChildren();
      clearInterval(globals.introScenery);
      giveBg(3);
      return stage.clear();
    };
    setState = function(newstate) {
      if (typeof newstate === "number") {
        return state = newstate;
      } else {
        return state = states[newstate.toUpperCase()];
      }
    };
    return window.board = {
      canvas: canvas,
      $canvas: $canvas,
      ctx: canvas.getContext("2d"),
      newGame: function() {
        newGame();
        return this;
      },
      getState: function() {
        return state;
      },
      getStage: function() {
        return stage;
      },
      initialize: function(runner) {
        initialize(runner);
        return this;
      },
      setState: function(newstate) {
        setState(newstate);
        return this;
      },
      clear: function() {
        clear();
        return this;
      },
      getKeysDisabled: function() {
        return keysDisabled;
      },
      setKeysDisabled: function(status) {
        keysDisabled = status;
        return this;
      }
    };
  });

}).call(this);
