# Halt! Hammerzeit.

Hammerzeit is my first foray into writing a game bigger than Frogger or Rush Hour. It will be a 2d RPG complete with sprites, items, tales of heroism and adventure, and perhaps even a small amount of.... eight bit music?? Who knows, man. I also want to add in more complex interactions as I become more comfortable with Easel.js.

#### Why..... Hammerzeit?

Shit needs codenames sometimes. Also it means "Stop! Hammertime." in German.


#### Modules

I'll be writing the game using require.js, backbone.js, and easel.js. There will be a lot of modules. Each "level" shall be its own module. 

4AM revelation: the architecture for this seems like fairly clear cut MVC. We need a taskrunner (controller) for the game - keeps track of global stuff like game state (battle, cutscene, travel, etc), but has hooks into the board module (view) and the player, npc, and controls module (models, sort of). 
