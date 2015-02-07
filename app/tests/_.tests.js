'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

/**
 * Unit tests
 */
describe('Wait for database connection:', function() {
	// This is a workaround to the following issue: https://github.com/meanjs/mean/issues/224
	// It appears to still not be fixed in master and I don't want to have to change the server.js source.
	// By running this test first, the db connection is started before the web server starts.
	it('should be connected', function(done) {
		User.find({}, function(err, users) {
			done();
		});
	});
});
