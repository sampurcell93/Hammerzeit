define ["globals", "utilities", "board", "mapper", "underscore", "backbone", "easel", "jquery"], (globals, ut, board, mapper) ->
	tileurl 	 = 'images/tiles/<%=name%>.<%=typeof filetype !== "undefined" ? filetype : "jpg" %>'
	tilewidth    = tileheight = 50
	tiles 		 = null
	_activechunk = null
	_activeprecursor = null
	_backbone = null

	class Tile extends Backbone.Model
        defaults: 
            # Type of tile (gets image if there is one)
            t: 'e'
            # Enterable? String points to direction checking functions
            e: ''
            # Elevation - checked against character's jump score
            elv: 0
            # Can a user end their move here?
            end: true
            # Difficulty - how many moves does it take to get through? Do not use "d" as key here
            m: 1
        initialize: (attrs) ->
            @on "expose", @expose
        expose: ->
            setTile @attributes

    class Row extends Backbone.Collection
        model: Tile

    class Chunk extends Backbone.Model
        defaults: ->
            rows = []
            for i in [0...globals.map.tileheight]
                rows[i] = row = new Row
                for j in [0...globals.map.tilewidth] 
                    row.add tile = new Tile({t: 'e'})
                    tile.x = j
                    tile.y = i
            return rows: rows
        export: ->
            str = "["
            _.each @get("rows"), (row) ->
                str += "["
                _.each row.models, (tile) ->
                    str += JSON.stringify(tile.toJSON()) + ","
                str = str.substring(0,str.length-1)
                str += "],"
            str.substring(0,str.length-1) + "]"
        # Takes in x,y pixel coords and returns the model at that position
        getFromCoords: (x, y)->
        	x /= 50
        	y /= 50
        	@get("rows")[y].at(x)

	$.getJSON "lib/json_packs/tiles.json", {}, (t) ->
		tiles = t
		# Initialize the tiles with common defaults
		_.each tiles, setDefaultTileAttrs

	setDefaultTileAttrs = (tile, key) -> 
		tile.url = _.template tileurl, tile
		tile.loaded = false
		if _.has tile, "subtypes"
			_.each tile["subtypes"], setDefaultTileAttrs

	# Takes in a string, for example "gwbr" and walks through the tiles object
	# until it finds an object and it returns the url for that parent
	getFromShorthand = (chars, nestedobj) ->
		if _.has(nestedobj, chars) then return nestedobj[chars]
		parent = chars.charAt 0
		console.log chars, nestedobj
		if _.has nestedobj[parent], "subtypes"
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

	setTile = (tile) ->
		_.extend(_activechunk.children[tile.y].children[tile.x], _.omit(tile, "x", "y"))


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

	modifyBackground = (bitmap) ->
		board.setBackground(bitmap.background || "")
		board.setBackgroundPosition(bitmap.background_position || "top left")

	return window.mapper = {
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
			modifyBackground bitmap
			_activechunk = container 
		clearChunk: (stage) ->
			clearChunk stage
		getVisibleChunk: () ->
			_activechunk
		setTile: (tile) ->
			setTile tile
		Tile: Tile
		Row: Row
		Chunk: Chunk
	}