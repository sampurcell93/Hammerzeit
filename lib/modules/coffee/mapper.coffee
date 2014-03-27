define ["globals", "utilities", "board", "underscore", "backbone", "easel", "jquery"], (globals, ut, board) ->
	tileurl 	 = 'images/tiles/<%=name%>.<%=typeof filetype !== "undefined" ? filetype : "jpg" %>'
	tilewidth    = tileheight = 50
	tiles 		 = null
	_activechunk = null
	_activeprecursor = null

	$.getJSON "lib/json_packs/tiles.json", {}, (t) ->
		tiles = t
		# Initialize the tiles with common defaults
		_.each tiles, setDefaultTileAttrs

	setDefaultTileAttrs = (tile, key) -> 
		tile.url = _.template tileurl, tile
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

	# Since PNG files are transparent and therefore unclickable in easel,
	# We add a "click area" to each tile
	createBitEventRegister = (bitmap, x, y) ->
		hit = new createjs.Shape()
		hit.graphics.beginFill("#000").drawRect 0, 0, 50, 50
		hit


	loadChunkFromURL: (url) ->
		# $.getJSON "lib/json_packs/hometown.json"


	loadChunk = (map) ->
		bitmaparray = []
		_.each map, (tile) ->
			# Check if it's an array - if so, flatten to make sure only 2D
			if $.isArray tile
				if tile.length is 1 
					extend = []
					for i in [0...globals.map.width/tilewidth] then extend.push tile[0]
				bitmaparray.push loadChunk _.flatten(extend || tile)
			else
				if typeof tile == "object"
					type = tile.t
				else type = tile
				temp = getFromShorthand type, tiles
				w = tile.width  || 1
				h = tile.height || 1
				# Create a new bitmap image, and extend the generic tile defaults onto it, followed by the specific tile settings
				bitmaparray.push(_.extend(new createjs.Bitmap(temp.url), (temp || {}), (tile || {})))
		bitmaparray

	# We have wrapper each chunk in a container, so a simple remove (0) should suffice here
	clearChunk = (stage) ->
		stage.removeChildAt 0

	renderChunk = (bitmap, stage, vertindex) ->
		vertindex || vertindex = 0
		container = new createjs.Container()
		container.x = 0
		container.y = 0
		_.each bitmap, (tile, i) ->
			if $.isArray tile
				container.addChild(renderChunk tile, stage, i)
			else
				tile.x = tilewidth * i
				tile.y = tileheight * vertindex
				tile.hitArea = createBitEventRegister(tile, tile.x, tile.y)
				container.addChild tile
		stage.terrain = bitmap
		stage.addChild container
		container


	return {
		# Expects an array of 14x14 2D arrays, or chunks, each of which represents one full view in the map. 
		loadChunk: (chunk) ->
			if typeof chunk is "string" then loadChunkFromURL chunk
			else 
				_activeprecursor = loadChunk chunk.tiles
				_.extend _activeprecursor, _.omit(chunk, "tiles")
		# Expects a bitmap (can be generated with loadMap) and a createjs stage. Will render the map to the stage
		# Returns a Container object with the bitmap inside it
		renderChunk: (bitmap, stage) ->
			clearChunk stage
			container = renderChunk bitmap, stage
			board.setBackground(bitmap.background)
			_activechunk = container 
		clearChunk: (stage) ->
			clearChunk stage
		getVisibleChunk: () ->
			_activechunk
		setTile: (tile) ->
			ut.c tile
			ut.c _activechunk
			_.extend(_activechunk.children[tile.y].children[tile.x], _.omit(tile, "x", "y"))
	}