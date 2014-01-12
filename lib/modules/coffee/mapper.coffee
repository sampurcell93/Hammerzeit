define ["globals", "utilities", "underscore", "easel", "jquery"], (globals, ut) ->
	tileurl = 'images/tiles/<%=name%>.jpg'
	tiles = {
		t: {
			name: 'trees'
			enter: true
			subtypes: {
				en: {
					name: "treeedgenorth"
					enter: true
				}
			}
		}
		g: {
			enter: true
			name: 'grass'
			subtypes: {
				wbr: {
					enter: false
					name: "grasswaterbottomright"
				}
				wtr: {
					enter: true
					name: "grasswatertopright"
				}
				wtl: {
					enter: true
					name: "grasswatertopleft"
				}
				wbl: {
					enter: false
					name: "grasswaterbottomleft"
				}
			}
		}
		m: {
			enter: false
			name: 'mountain'
		}
		w: {
			enter: false
			name: 'water'

			subtypes: {
				v: {
					enter: false
					name: 'watervertical'
				}
				h: { enter: false, name: 'waterhorizontal'}
			}
		}
		f: {
			enter: true
			name: 'forest'
		}
		s: {
			enter: true
			name: 'sand'
		}
	}
	tilewidth = tileheight = 50

	setDefaultTileAttrs = (tile, key) -> 
		tile.url = _.template tileurl, {name: tile.name}
		tile.loaded = false
		if tile.hasOwnProperty("subtypes")
			_.each tile["subtypes"], setDefaultTileAttrs


	# Initialize the tiles with common defaults
	_.each tiles, setDefaultTileAttrs

	# TODO
	# Breaks a map matrix into a series of matrices with 14*14 tile dimensions
	# For now, just pass in an array of 14x14s
	chunkify = (matrix) -> matrix
			
	# Takes in a string, for example "gwbr" and walks through the tiles object
	# until it finds an object and it returns the url for that parent
	getFromShorthand = (chars, nestedobj) ->
		if nestedobj.hasOwnProperty(chars) then return nestedobj[chars].url
		parent = chars.charAt 0
		if nestedobj[parent].hasOwnProperty("subtypes")
			getFromShorthand chars.slice(1), nestedobj[parent].subtypes
		else return nestedobj[parent].url

	loadMap = (map, exceptions) ->
		bitmaparray = []
		_.each map, (tile, i, j) ->
			ut.c tile
			# Check if it's an array - if so, flatten to make sure only 2D
			if $.isArray tile
				bitmaparray.push loadMap _.flatten(tile)
			else
				if typeof tile == "object"
					type = tile.type
				else type = tile
				bitmaparray.push new createjs.Bitmap(getFromShorthand type, tiles)
		ut.c bitmaparray
		bitmaparray

	renderMap = (bitmap, stage, vertindex) ->
		vertindex || vertindex = 0
		_.each bitmap, (tile, i) ->
			if $.isArray tile
				renderMap tile, stage, i
			else
				tile.x = tilewidth * i
				tile.y = tileheight * vertindex
				stage.addChild tile
		stage.terrain = bitmap

	return {
		# Expects a 2d Array of characters, along with an optional array of objects with 
		# x y coordinate exceptions. For example, ["g","g","g"], [{x: 0, y: 0, except: {enter: false}}]
		# will create a width 3 height 1 strip of grass where the first square cannot be entered.
		# Returns a 2D array of bitmaps!
		loadMap: (mapChunks, exceptions) ->
			fullmap = []
			_.each mapChunks, (chunk) ->
				fullmap.push(loadMap chunk, exceptions)
			fullmap

		# Expects a bitmap (can be generated with loadMap) and a createjs stage. Will render the map to the stage
		renderMap: (bitmap, stage) ->
			renderMap bitmap, stage

	}