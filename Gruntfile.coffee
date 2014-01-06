module.exports = (grunt) =>

	grunt.initConfig
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
		  livereload:
		    files: ["stylesheets/*.css"]
		   	options:
		      livereload: true

	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-contrib-compass'
	# grunt.registerTask "compass", "compile sass", =>
