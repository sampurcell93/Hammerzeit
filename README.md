## The Code  
    
I'll be using require.js to break the code up into modules, written in coffescript. Once the frontend of the game is built, I expect to write a simple API with node or Flask. The modules can be found in lib/modules/coffee. The HTML5 Canvas API is the primary showrunner here, though I'm using the createjs wrapper API. The other main component is Backbone.js, because it allows me to connect modules easily with a mediator/observer pattern. The game will use DOM elements in addition to the canvas, because text writing leaves a lot to be desired in pure canvas.  

## The Premise

The inspiration for this game lies in several classics from my childhood: Disgaea: Hour of Darkness; Golden Sun; Fire Emblem; Pokemon; Dragon Warrior; the list really does go on! When the story has been written, I'll talk about that, but for now I'm concerned with the game engine. The core of those games were their battle systems - almost every progression was dependent on combat. An interesting thing I noticed about those systems was the relative segmentation of game states. Traveling was walking in tiled environments, and battle was a separate screen with either no battlefield at all, or a predefined one. Obviously, newer games like Oblivion and Skyrim have established an amazing blend of game states, but I have not played any "traditional" 2.5D RPGs with quite as good a blending. The game should be able to switch seamlessly between multiple states without a context shift for the player. That is, battles should occur spontaneously on the same map that travel does. 

I think one significant reason that this was difficult to achieve in past generations was simply a lack of resources. The amount of data required to maintain a world-sized game board was large, and the technology of those systems was comparatively primitive with today's. So they made significant tradeoffs (and still made fabuolous games!). 

So, why not just accept that this has been done better by Bethesda, and in THREE dimensions? Because this is fun. 

