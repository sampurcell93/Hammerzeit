module.exports = (grunt) =>

	grunt.initConfig
		# Works for now, but inefficient - compiles ALL coffee files each time one is saved
		coffee:
			dist:
				files: [{
					expand: true
					flatten: true
					cwd: 'lib/modules/coffee/'
					src: ['*.coffee']
					dest: 'lib/modules/js'
					rename: (dest, src) ->
  						dest + "/" + src.replace(/\.coffee$/, ".js")
				}]
		compass:
			dist:
				options:
					sassDir: 'sass'
					cssDir: 'stylesheets'
					environment: 'production'
			dev:
				options:
					sassDir: 'sass'
					cssDir: 'stylesheets'
		watch:
		  sass:
		    files: ["sass/*.scss"]
		    tasks: ["compass:dist"]
		  css:
		    files: ["*.css"]
		  coffee:
		  	files: ['lib/modules/coffee/*.coffee']
		  	tasks: ['coffee:dist']
		  livereload:
		    files: ["stylesheets/*.css"]
		   	options:
		      livereload: true

	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-contrib-compass'
	grunt.loadNpmTasks 'grunt-contrib-coffee'
	grunt.registerTask "default", ['watch']
