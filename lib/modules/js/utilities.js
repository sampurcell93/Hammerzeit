(function() {
  define("utilities", ["jquery", "underscore"], function() {
    if (typeof Object.create !== "function") {
      Object.create = function(o) {
        var F;
        F = function() {};
        F.prototype = o;
        return new F();
      };
    }
    return {
      c: function() {
        var arg, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
          arg = arguments[_i];
          _results.push(console.log(arg));
        }
        return _results;
      },
      create: Object.create,
      addEventListeners: function(obj, events) {
        return _.each(events, function(fn, name) {
          return obj.addEventListener(name, fn);
        });
      }
    };
  });

}).call(this);
