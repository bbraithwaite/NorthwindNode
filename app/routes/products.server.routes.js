'use strict';

module.exports = function(app) {
	var products = require('../../app/controllers/products.server.controller');
	var users = require('../../app/controllers/users.server.controller');
	
	app.route('/products')
		.get(products.list)
		.post(users.requiresLogin, products.create);

	app.route('/products/:productId')
		.get(products.read)
		.put(users.requiresLogin, products.update)
		.delete(users.requiresLogin, pproducts.delete);

	// Finish by binding the article middleware
	app.param('productId', products.getByID);
};
