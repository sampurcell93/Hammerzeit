define ["globals", "utilities", "underscore", "easel", "jquery"], (globals, ut) ->
	tileurl 	 = 'images/tiles/<%=name%>.jpg'
	tilewidth    = tileheight = 50
	tiles 		 = null
	_activechunk = null

	$.getJSON "lib/json_packs/tiles.json", {}, (t) ->
		tiles = t
		# Initialize the tiles with common defaults
		_.each tiles, setDefaultTileAttrs



	setDefaultTileAttrs = (tile, key) -> 
		tile.url = _.template tileurl, {name: tile.name}
		tile.loaded = false
		if tile.hasOwnProperty("subtypes")
			_.each tile["subtypes"], setDefaultTileAttrs

	# Takes in a string, for example "gwbr" and walks through the tiles object
	# until it finds an object and it returns the url for that parent
	getFromShorthand = (chars, nestedobj) ->
		if nestedobj.hasOwnProperty(chars) then return nestedobj[chars]
		parent = chars.charAt 0
		if nestedobj[parent].hasOwnProperty("subtypes")
			getFromShorthand chars.slice(1), nestedobj[parent].subtypes
		else nestedobj[parent]

	loadChunk = (map) ->
		bitmaparray = []
		ut.c map
		_.each map, (tile, i, j) ->
			# Check if it's an array - if so, flatten to make sure only 2D
			if $.isArray tile
				bitmaparray.push loadChunk _.flatten(tile)
			else
				if typeof tile == "object"
					type = tile.type
					console.log tile
				else type = tile
				temp = getFromShorthand type, tiles
				bitmaparray.push _.extend(new createjs.Bitmap(temp.url), (tile || {}), (temp || {}))
		bitmaparray

	# A chunk is a 14X14 array
	clearChunk = (stage) ->
		stage.removeChildAt 0

	renderChunk = (bitmap, stage, vertindex) ->
		vertindex || vertindex = 0
		container = new createjs.Container()
		_.each bitmap, (tile, i) ->
			if $.isArray tile
				container.addChild(renderChunk tile, stage, i)
			else
				tile.x = tilewidth * i
				tile.y = tileheight * vertindex
				container.addChild tile
		stage.terrain = bitmap
		stage.addChild container
		_activechunk = container 


	return {
		# Expects an array of 14x14 2D arrays, or chunks, each of which represents one full view in the map. 
		loadChunk: (chunk) ->
			loadChunk chunk
		# Expects a bitmap (can be generated with loadMap) and a createjs stage. Will render the map to the stage
		# Returns a Container object with the bitmap inside it
		renderChunk: (bitmap, stage) ->
			clearChunk stage
			ut.c stage
			renderChunk bitmap, stage
		clearChunk: (stage) ->
			clearChunk stage
		getVisibleChunk: (stage) ->
			_activechunk
	}