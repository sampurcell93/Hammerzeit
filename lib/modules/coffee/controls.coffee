# 38 up 37 left 39 right 40 down
define "controls", ["utilities", "board", "jquery"], (ut, board, $) =>
	$c = board.$canvas.focus()
	ut.c board
	$c.on "keydown", (e) =>
		key = e.keyCode || e.which
		ut.c key
