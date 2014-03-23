(function() {
  define(['globals', 'utilities', 'jquery', 'underscore', 'easel'], function(globals, ut) {
    var $canvas, addCharacter, addState, board, canvas, clear, initialize, introSlider, moveObjectTo, removeState, scenecount, scenelen, setPresetBackground, setState, stage, startSlideshow, state, states, taskrunner, textshadow, ticker, walkingMan;
    canvas = document.getElementById("game-board");
    $canvas = $(canvas);
    states = globals.states;
    stage = new createjs.Stage(canvas);
    stage.enableMouseOver(1000);
    ticker = createjs.Ticker;
    ticker.addEventListener("tick", function(tick) {
      if (!tick.paused) {
        return stage.update();
      }
    });
    state = ["INTRO"];
    taskrunner = null;
    textshadow = globals.textshadow = new createjs.Shadow("#000000", 0, 0, 7);
    scenecount = 0;
    scenelen = 6;
    setPresetBackground = function(bg) {
      return $canvas.attr("bg", bg);
    };
    introSlider = function(count) {
      if (count === -1) {
        return $canvas.attr("bg", "image-none");
      } else {
        return $canvas.attr("bg", "image-" + parseInt(((count || scenecount++) % scenelen) + 1));
      }
    };
    startSlideshow = function() {
      introSlider();
      return globals.introScenery = setInterval(function() {
        if (scenecount !== 7) {
          return introSlider();
        } else {
          clearInterval(globals.introScenery);
          return globals.introScenery = setInterval(introSlider, 13400);
        }
      }, 0);
    };
    walkingMan = function() {
      var sheet, sprite;
      sheet = new createjs.SpriteSheet({
        framerate: 30,
        frames: [[0, 165, 55, 55, 0], [55, 165, 55, 55, 0], [110, 165, 55, 55, 0], [165, 165, 55, 55, 0]],
        animations: {
          run: [0, 3]
        },
        images: ["images/sprites/hero.png"]
      });
      sheet.getAnimation("run").speed = .13;
      sheet.getAnimation("run").next = "run";
      sprite = new createjs.Sprite(sheet, "run");
      sprite.x = 0;
      sprite.y = 0;
      sprite.scaleY = sprite.scaleX = 1;
      return stage.addChild(sprite);
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
      newgame.addEventListener("click", function() {
        return taskrunner.newGame();
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
          return loadgame.font = "bold 30px Arial";
        },
        "mouseout": function() {
          return loadgame.font = "30px Arial";
        }
      });
      copyright = new createjs.Text("Game copyright " + globals.author + " 2014", "14px Arial", "rgba(255,255,255,.5)");
      _.extend(copyright, {
        x: 10,
        y: 680,
        shadow: textshadow
      });
      stage.addChild(newgame, loadgame, title, copyright);
      return walkingMan();
    };
    clear = function() {
      stage.removeAllChildren();
      return stage.clear();
    };
    addState = function(newstate) {
      return state.push(newstate);
    };
    setState = function(newstate) {
      return state = [newstate];
    };
    removeState = function(removeme) {
      var index;
      if ($.isArray(state) && state.length > 1) {
        index = state.indexOf(removeme);
        if (index !== -1) {
          state.splice(index, 1);
        }
      } else {
        throw new Error("The board currently has only one state - you can't remove it.");
      }
      return state;
    };
    addCharacter = function(character) {
      stage.addChild(character.marker);
      return character.stage = stage;
    };
    moveObjectTo = function(item, x, y, options) {
      return ut.c(item, x, y, options);
    };
    return board = {
      canvas: canvas,
      $canvas: $canvas,
      ctx: canvas.getContext("2d"),
      setPresetBackground: function(bg) {
        setPresetBackground(bg);
        return this;
      },
      getState: function() {
        return state;
      },
      hasState: function(checkstate) {
        if ($.isArray(state)) {
          return state.indexOf(checkstate) !== -1;
        } else {
          return state === checkstate;
        }
      },
      getStage: function() {
        return stage;
      },
      initialize: function(runner) {
        initialize(runner);
        return this;
      },
      setState: function(state) {
        return setState(state);
      },
      addState: function(newstate) {
        addState(newstate);
        return this;
      },
      removeState: function(removeme) {
        removeState(removeme);
        return this;
      },
      clear: function() {
        clear();
        return this;
      },
      addCharacter: function(character) {
        return addCharacter(character);
      },
      moveObjectTo: function(item, x, y, options) {
        return moveObjectTo(item, x, y, options);
      }
    };
  });

}).call(this);
