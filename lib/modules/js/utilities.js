(function() {
  define(["jquery", "underscore"], function() {
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
      },
      underline: function(ctx, text, x, y, size, color, thickness, offset) {
        var width;
        width = ctx.measureText(text).width;
        switch (ctx.textAlign) {
          case "center":
            x -= width / 2;
            break;
          case "right":
            x -= width;
        }
        y += size + (offset || 1);
        ctx.beginPath();
        ctx.strokeStyle = color || "#fff";
        ctx.lineWidth = thickness || 2;
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        return ctx.stroke();
      }
    };
  });

}).call(this);
