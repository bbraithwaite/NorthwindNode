'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	BasicStrategy = require('passport-http').BasicStrategy,
	User = require('mongoose').model('User');

module.exports = function() {
	// Use basic strategy
	passport.use(new BasicStrategy({
			usernameField: 'username',
			passwordField: 'password'
		},
		function(username, password, done) {
			User.findOne({
				username: username
			}, function(err, user) {
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(null, false, {
						message: 'Unknown user or invalid password'
					});
				}
				if (!user.authenticate(password)) {
					return done(null, false, {
						message: 'Unknown user or invalid password'
					});
				}

				return done(null, user);
			});
		}
	));
};
