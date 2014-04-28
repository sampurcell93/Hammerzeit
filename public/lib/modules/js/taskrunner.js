(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["globals", "utilities", "board", "npc", "player", "mapper", "mapcreator"], function(globals, ut, board, NPC, player, mapper, mapcreator) {
    var Loader, SignUp, User, getPC, getParty, getPlayer, loadGame, loadStage, newGame, saveGame, t, _ref, _ref1, _ref2, _user;
    _user = null;
    globals.shared_events.on("newgame", function() {
      return newGame();
    });
    globals.shared_events.on("savegame", function() {
      return saveGame();
    });
    User = (function(_super) {
      __extends(User, _super);

      function User() {
        _ref = User.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      User.prototype.idAttribute = '_id';

      User.prototype.url = function() {
        if (this.get("username")) {
          return '/users/' + this.get("username");
        } else {
          return "/users/";
        }
      };

      User.prototype.parse = function(user) {
        user.party = new player.PCArray(user.party, {
          parse: true
        });
        return user;
      };

      User.prototype.defaults = {
        party: new player.PCArray([
          new player.model({
            path: 'Dragoon'
          }), new player.model({
            path: 'Healer',
            name: 'Jack',
            HP: 57
          })
        ])
      };

      User.prototype.clean = function(pcs) {
        var j,
          _this = this;
        if (pcs == null) {
          pcs = [];
        }
        j = this.toJSON();
        _.each(j.party.models, function(p) {
          return pcs.push(p.prepareForSave());
        });
        return _.extend(j, {
          party: pcs
        });
      };

      return User;

    })(Backbone.Model);
    Loader = (function(_super) {
      __extends(Loader, _super);

      function Loader() {
        _ref1 = Loader.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Loader.prototype.template = $("#load-game").html();

      Loader.prototype.initialize = function(_arg) {
        this.username = _arg.username;
      };

      Loader.prototype.render = function() {
        this.$el.html(_.template(this.template, {
          username: this.username
        }));
        return this;
      };

      Loader.prototype.events = {
        "click .js-start-game": function() {
          _user = new User({
            username: $(".username").val()
          });
          return _user.fetch({
            success: function() {
              loadStage(1);
              window.PC = _user.get("party").at(0);
              return ut.destroyModal();
            },
            parse: true
          });
        }
      };

      return Loader;

    })(Backbone.View);
    SignUp = (function(_super) {
      __extends(SignUp, _super);

      function SignUp() {
        _ref2 = SignUp.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      SignUp.prototype.template = $("#new-game").html();

      SignUp.prototype.render = function() {
        this.$el.html(_.template(this.template));
        return this;
      };

      SignUp.prototype.events = function() {
        return {
          "click .js-start-game": function() {
            var _this = this;
            _user = new User({
              username: 'Sams',
              password: 'Sampass'
            });
            return _user.save(_user.clean(), {
              success: function(u, resp) {
                ut.destroyModal();
                localStorage.setItem("username", resp.username);
                return loadStage(1);
              }
            });
          }
        };
      };

      return SignUp;

    })(Backbone.View);
    loadStage = function(module) {
      board.addState("LOADING");
      return require(["lib/modules/js/stage" + module], function(level) {
        var PC;
        PC = getPC();
        board.removeState("LOADING");
        return PC.on("change:current_chunk", function() {
          var full_chunk, newchunk;
          newchunk = PC.get("current_chunk");
          board.setBackground(level.getBackground());
          mapcreator.loadChunk(level.getBitmap()[newchunk.y][newchunk.x], newchunk.x, newchunk.y);
          mapcreator.render();
          full_chunk = level.getBitmap()[newchunk.y][newchunk.x];
          return mapper.renderChunk(full_chunk, board.getStage());
        });
      });
    };
    loadGame = function(id) {
      var loader;
      loader = new Loader({
        username: id
      });
      return ut.launchModal(loader.render().el);
    };
    newGame = function() {
      var signup;
      signup = new SignUp();
      return ut.launchModal(signup.render().el);
    };
    saveGame = function() {
      var savedparty;
      savedparty = _user.get("party");
      return _user.save(_user.clean(), {
        success: function() {
          _user.set("party", savedparty);
          return alert("game saved");
        }
      });
    };
    getParty = function() {
      return _user.get("party");
    };
    getPlayer = function(index) {
      return getParty().at(index);
    };
    getPC = function() {
      return getPlayer(0);
    };
    return t = window.taskrunner = {
      newGame: function() {
        return newGame();
      },
      loadGame: function(userid) {
        if (userid == null) {
          userid = null;
        }
        if (localStorage.getItem("username")) {
          return loadGame(localStorage.getItem("username"));
        } else {
          return loadGame(userid);
        }
      },
      loadStage: function(module) {
        return loadStage(module);
      },
      setUser: function(key, val) {
        return _user.set(key, val);
      },
      getUser: function() {
        return _user;
      },
      getPC: function() {
        return getPC();
      },
      getParty: function() {
        return getParty();
      },
      getPlayerAt: function(index) {
        return getPlayer(index);
      }
    };
  });

}).call(this);
