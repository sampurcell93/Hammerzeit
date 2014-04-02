(function() {
  define(['globals', 'utilities', 'jquery', 'underscore', 'easel'], function(globals, ut) {
    var $canvas, Cursor, addMarker, addState, blurBoard, board, canvas, clear, flashStateChange, hasState, initialize, introSlider, removeState, scenecount, scenelen, setPresetBackground, setState, stage, startSlideshow, state, stateChangeEvents, states, textshadow, unblurBoard, zoomIn, zoomOut, _cursor, _mapheight, _mapwidth, _ticker, _zoom,
      _this = this;
    canvas = document.getElementById("game-board");
    $canvas = $(canvas);
    _zoom = 0;
    _mapwidth = _mapheight = 0;
    states = globals.states;
    window.stage = stage = new createjs.Stage(canvas);
    stage.enableMouseOver(200);
    stage.enableDOMEvents(true);
    _ticker = createjs.Ticker;
    _ticker.addEventListener("tick", function(tick) {
      if (!tick.paused) {
        return stage.update();
      }
    });
    state = ["INTRO"];
    textshadow = globals.textshadow = new createjs.Shadow("#000000", 0, 0, 7);
    scenecount = 0;
    scenelen = 6;
    Cursor = (function() {
      Cursor.prototype.offset = -13;

      function Cursor() {
        var sheet, spritesheet;
        spritesheet = {
          framerate: 30,
          animations: {
            bounce: [0, 12]
          },
          images: ["images/sprites/cursorsprite.png"],
          frames: [[0, 0, 50, 70], [50, 0, 50, 70], [100, 0, 50, 70], [150, 0, 50, 70], [200, 0, 50, 70], [250, 0, 50, 70], [300, 0, 50, 70], [300, 0, 50, 70], [250, 0, 50, 70], [200, 0, 50, 70], [150, 0, 50, 70], [100, 0, 50, 70], [50, 0, 50, 70], [0, 0, 50, 70]]
        };
        sheet = new createjs.SpriteSheet(spritesheet);
        sheet.getAnimation("bounce").speed = .63;
        sheet.getAnimation("bounce").next = "bounce";
        this.marker = new createjs.Sprite(sheet, "bounce");
        this.marker.x = 0;
        this.marker.y = this.offset;
      }

      Cursor.prototype.show = function() {
        return stage.addChild(this.marker);
      };

      Cursor.prototype.hide = function() {
        return stage.removeChild(this.marker);
      };

      Cursor.prototype.move = function(x, y) {
        this.marker.x = x;
        return this.marker.y = y + this.offset;
      };

      return Cursor;

    })();
    _cursor = new Cursor();
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
    initialize = function() {
      var copyright, loadgame, newgame, title;
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
        return globals.shared_events.trigger("newgame");
      });
      loadgame = new createjs.Text("Load Game", "30px Arial", "#f9f9f9");
      _.extend(loadgame, {
        x: 380,
        y: 280,
        shadow: textshadow,
        cursor: 'pointer'
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
      return stage.addChild(newgame, loadgame, title, copyright);
    };
    clear = function() {
      stage.removeAllChildren();
      return stage.clear();
    };
    flashStateChange = function() {
      var ct, flash, rect;
      rect = new createjs.Shape();
      rect.graphics.beginFill("#000").drawRect(0, 0, globals.map.width, globals.map.height);
      ct = 0;
      return flash = setInterval(function() {
        stage.addChild(rect);
        setTimeout(function() {
          return stage.removeChild(rect);
        }, 200);
        if (ct++ > 4) {
          return clearInterval(flash);
        }
      }, 30);
    };
    stateChangeEvents = {
      add: {
        "BATTLE": function() {
          ut.c("the state has changed to battle. get it son");
          flashStateChange();
          return globals.shared_events.trigger("battle");
        },
        "LOADING": function() {
          return ut.c("the state has changed to loading. spinny wheel brah");
        }
      },
      remove: {
        "BATTLE": function() {
          return ut.c("Battle over...");
        },
        "TRAVEL": function() {
          return ut.c("travel done");
        },
        "LOADING": function() {
          return ut.c("loading over");
        }
      }
    };
    addState = function(newstate) {
      var fn;
      if (hasState(newstate) === false) {
        state.push(newstate);
        fn = stateChangeEvents.add[newstate];
        if (fn != null) {
          return fn();
        }
      }
    };
    setState = function(newstate) {
      return state = [newstate];
    };
    removeState = function(removeme) {
      var fn, index;
      if (state.length > 1) {
        index = state.indexOf(removeme);
        if (index !== -1) {
          state.splice(index, 1);
        }
        fn = stateChangeEvents.remove[removeme];
        if (fn != null) {
          fn();
        }
      } else {
        throw new Error("The board currently has only one state - you can't remove it. Try adding another state first.");
      }
      return state;
    };
    addMarker = function(obj, at) {
      if (at) {
        stage.addChildAt(obj, at);
      } else {
        console.log(obj.marker);
        stage.addChild(obj.marker);
      }
      return obj.stage = stage;
    };
    hasState = function(checkstate) {
      checkstate = checkstate.toUpperCase();
      if ($.isArray(state)) {
        return state.indexOf(checkstate) !== -1;
      } else {
        return state === checkstate;
      }
    };
    zoomOut = function() {
      var current, newstr;
      current = $canvas.css("background-size").split(" ");
      current = _.map(current, function(num) {
        return parseInt(num);
      });
      if (isNaN(current[0])) {
        current[0] = _mapwidth;
        current[1] = _mapheight;
      }
      if (current[0] === 1000 || current[1] === 700) {
        return _zoom;
      }
      newstr = current[0] - globals.map.width + "px ";
      newstr += current[1] - globals.map.height + "px";
      $canvas.css("background-size", newstr);
      return _zoom -= 1;
    };
    zoomIn = function() {
      var current, newstr;
      current = $canvas.css("background-size").split(" ");
      current = _.map(current, function(num) {
        return parseInt(num);
      });
      if (current === "auto" || current[0] >= _mapwidth || current[1] >= _mapheight) {
        return _zoom;
      }
      newstr = current[0] + globals.map.width + "px ";
      newstr += current[1] + globals.map.height + "px";
      $canvas.css("background-size", newstr);
      return _zoom++;
    };
    blurBoard = function() {
      var blurFilter, bounds, shape;
      shape = new createjs.Shape().set({
        x: 0,
        y: 0
      });
      shape.graphics.beginFill("#ff0000").drawRect(0, 0, 50);
      blurFilter = new createjs.BlurFilter(5, 5, 1);
      shape.filters = [blurFilter];
      bounds = blurFilter.getBounds();
      shape.cache(bounds.x, bounds.y, globals.map.width + bounds.width, bounds.height + globals.map.height);
      shape.name = "blurfilter";
      return stage.addChild(shape);
    };
    unblurBoard = function() {
      return stage.removeChild(stage.getChildByName("blurfilter"));
    };
    board = {
      canvas: canvas,
      $canvas: $canvas,
      getTicker: function() {
        return _ticker;
      },
      ctx: canvas.getContext("2d"),
      setPresetBackground: function(bg) {
        setPresetBackground(bg);
        return this;
      },
      getState: function() {
        return state;
      },
      hasState: function(checkstate) {
        return hasState(checkstate);
      },
      getStage: function() {
        return stage;
      },
      initialize: function() {
        initialize();
        return this;
      },
      /* All state getters and setters are case insensitive!*/

      setState: function(state) {
        setState(state.toUpperCase());
        return this;
      },
      addState: function(newstate) {
        addState(newstate.toUpperCase());
        return this;
      },
      removeState: function(removeme) {
        removeme = removeme.toUpperCase();
        if (hasState(removeme)) {
          removeState(removeme);
        }
        return this;
      },
      toggleState: function(state) {
        if (hasState(state)) {
          return removeState(state);
        } else {
          return addState(state);
        }
      },
      clear: function() {
        clear();
        return this;
      },
      addMarker: function(character, at) {
        return addMarker(character, at);
      },
      setBackgroundPosition: function(position) {
        if (!position) {
          return this;
        }
        $canvas.css("background-position", position);
        return this;
      },
      setBackground: function(url) {
        if (!url) {
          return this;
        }
        $canvas.css("background-image", "url(" + url + ")");
        return this;
      },
      getZoom: function() {
        return _zoom;
      },
      zoomIn: function() {
        return zoomIn();
      },
      zoomOut: function() {
        return zoomOut();
      },
      setMapSize: function(width, height) {
        _mapwidth = width;
        return _mapheight = height;
      },
      pause: function(opts) {
        opts = _.extend({}, opts);
        if (opts.blur) {
          blurBoard();
        }
        _ticker.setPaused(true);
        return this;
      },
      unpause: function() {
        unblurBoard();
        _ticker.setPaused(false);
        return this;
      },
      getPaused: function() {
        return _ticker.getPaused();
      },
      slowTo: function(interval) {
        _ticker.setInterval(interval);
        return this;
      },
      blur: function(amount) {
        blurBoard();
        return this;
      },
      unblur: function() {
        unblurBoard();
        return this;
      },
      focus: function() {
        $canvas.focus();
        return this;
      },
      showCursor: function() {
        return _cursor.show();
      },
      hideCursor: function() {
        return _cursor.hide();
      },
      moveCursor: function(x, y) {
        return _cursor.move(x, y);
      }
    };
    board.initialize();
    return window.board = board;
  });

}).call(this);
