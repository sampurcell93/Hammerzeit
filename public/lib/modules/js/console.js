(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["utilities", "globals"], function(ut, globals) {
    var Console, Line, Message, Messages, activity, handleEvent, _console, _events, _ref, _ref1, _ref2, _ref3,
      _this = this;
    _events = globals.shared_events;
    Message = (function(_super) {
      __extends(Message, _super);

      function Message() {
        _ref = Message.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Message.prototype.defaults = function() {
        return {
          text: "Message!"
        };
      };

      return Message;

    })(Backbone.Model);
    Messages = (function(_super) {
      __extends(Messages, _super);

      function Messages() {
        _ref1 = Messages.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Messages.prototype.model = Message;

      return Messages;

    })(Backbone.Collection);
    Line = (function(_super) {
      __extends(Line, _super);

      function Line() {
        _ref2 = Line.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      Line.prototype.tagName = 'li';

      Line.prototype.template = "<%= text %>";

      Line.prototype.initialize = function() {
        return this.listenTo(this.model, {
          "destroy": function() {
            return this.remove();
          }
        });
      };

      Line.prototype.render = function() {
        this.$el.html(_.template(this.template, this.model.toJSON()));
        return this;
      };

      return Line;

    })(Backbone.View);
    Console = (function(_super) {
      __extends(Console, _super);

      function Console() {
        _ref3 = Console.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      Console.prototype.el = '.game-console';

      Console.prototype.msgLen = 50;

      Console.prototype.initialize = function() {
        return this.listenTo(this.collection, {
          "add": this.emit
        });
      };

      Console.prototype.trimOldMessages = function() {
        var diff, to_prune;
        if (this.collection.length > this.msgLen) {
          diff = this.collection.length - this.msgLen;
          to_prune = this.collection.slice(0, diff);
          while (to_prune.length) {
            to_prune.shift().destroy();
          }
        }
        return this;
      };

      Console.prototype.emit = function(model) {
        var $el, line;
        line = new Line({
          model: model
        });
        $el = this.$el;
        this.$("ol").append(line.render().el);
        $el.animate({
          scrollTop: $el[0].scrollHeight
        }, "slow");
        return this.trimOldMessages();
      };

      Console.prototype.events = {
        "click .js-toggle": function() {
          return this.$el.toggleClass("hidden");
        }
      };

      return Console;

    })(Backbone.View);
    _console = new Console({
      collection: new Messages
    });
    handleEvent = function(type) {
      type = type.split(":");
      switch (type[0]) {
        case "state":
          return activity.emit("State changed to " + type[1]);
        case "items":
          return activity.emit("Items were " + type[1]);
        case "powers":
          return activity.emit("Powers were " + type[1]);
        case "menu":
          break;
        case "battle":
          if (type[1] === "timerdone") {
            return activity.emit("" + (arguments[1].get('name')) + " failed to act, and lost an action");
          }
          break;
        case "game":
          return activity.emit("Game " + type[1] + " loaded");
        default:
          return activity.emit(type.join(":"));
      }
    };
    activity = {
      emit: function(message, opts) {
        return _console.collection.add(new Message(_.extend({
          text: message
        }, opts)));
      }
    };
    _events.on("all", handleEvent);
    return activity;
  });

}).call(this);
