(function() {
  define("controls", ["utilities", "board", "jquery"], function(ut, board, $) {
    var $c,
      _this = this;
    $c = board.$canvas.focus();
    ut.c(board);
    return $c.on("keydown", function(e) {
      var key;
      key = e.keyCode || e.which;
      return ut.c(key);
    });
  });

}).call(this);
