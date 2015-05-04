'use strict';

var passport = require('passport');

module.exports = function(req, res, next) {
	if (req.headers.authorization) {
		passport.authenticate('basic', { session: false }, function(err, user, info) {
			if (user) {
				req.apiAuthed = true;
			}
			next();
		})(req, res, next);

	} else {
		next();
	}
};
