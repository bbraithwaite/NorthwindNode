'use strict';

module.exports = function(app) {
	var products = require('../controllers/products.server.controller');
	var users = require('../controllers/users.server.controller');
	var apiAuth = require('../controllers/api.authorization.server.controller');
	
	app.route('/products')
		.get(apiAuth, users.requiresLogin, products.list)
		.post(apiAuth, users.requiresLogin, products.create);

	app.route('/products/:productId')
		.get(apiAuth, users.requiresLogin, products.read)
		.put(apiAuth, users.requiresLogin, products.update)
		.delete(apiAuth, users.requiresLogin, products.delete);

	// Finish by binding the article middleware
	app.param('productId', products.getByID);
};
