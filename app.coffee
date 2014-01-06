require.config
	paths: 
		'jquery': 'lib/jquery'
		'underscore': 'lib/underscore'
		'backbone': 'lib/backbone'

define "First", ["underscore"], =>
	console.log "First module bro, get at me"
	console.log _

require ["First"]