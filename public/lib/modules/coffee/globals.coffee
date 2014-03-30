define ["underscore", "backbone"], =>

	return {
		name: 'Hammerzeit!'
		version: 0.1
		author: "Sam Purcell"
		dev : true
		states:  {
			0: "INTRO"
			1: "WAITING"
			2: "BATTLE"
			3: "CUTSCENE"
			4: "TRAVEL"
			5: "DRAWING"
			6: "LOADING"
			7: "MENUOPEN"
		}
		map:
			width: 1000
			height: 700
			# sprite bounds
			c_width: 950
			c_height: 650
			tilewidth: 20
			tileheight: 14
			tileside: 50
		shared_events: _.extend {}, Backbone.Events
		tile_url: "lib/json_packs/tiles.json"
	}