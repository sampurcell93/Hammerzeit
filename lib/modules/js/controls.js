(function() {
  var _this = this;

  define("controls", ["utilities", "board", "jquery"], function(ut, board, $) {
    var $c;
    $c = board.$canvas.focus();
    ut.c(board);
    return $c.on("keydown", function(e) {
      var key;
      key = e.keyCode || e.which;
      return ut.c(key);
    });
  });

}).call(this);
