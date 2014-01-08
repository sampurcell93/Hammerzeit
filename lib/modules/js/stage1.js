(function() {
  define(["utilities", "board", "dialog", "globals", "underscore", "jquery"], function(ut, board, dialog, globals) {
    return {
      initialize: function() {
        board.clear();
        dialog.initialize();
        return dialog.loadDialogSet([
          {
            text: function() {
              var str;
              str = 'I did not come to this land on purpose. I grew up far from here, in a land of beauty and mystique.';
              str += 'This place is a shadow of my homeland. They always tell you to live in the moment, or to look to the future.';
              str += 'As I lay dying, there is no future, and the moment does not bear thought. The past is all that is left...';
              return str;
            },
            delay: 12000,
            options: {
              before: function() {
                return board.setKeysDisabled(true);
              },
              speed: 105
            }
          }, {
            text: "When was the last time I saw a demon or a demigod? I can’t remember. My memories are crumbling like old paper.",
            delay: 8000
          }, {
            text: 'Perhaps I should show you, before they are gone forever. Someone needs to understand.',
            options: {
              after: function() {
                board.setKeysDisabled(false);
                return board.setState(globals.states.WAITING);
              }
            }
          }
        ]);
      }
    };
  });

}).call(this);
