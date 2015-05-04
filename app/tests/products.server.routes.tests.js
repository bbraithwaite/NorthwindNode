'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	productApi = require('./models.server.routes.tests.api')(app, 'Product','/products/'),
	categoryApi = require('./models.server.routes.tests.api')(app, 'Category', '/categories/'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

/**
 * Unit tests
 */
describe('Product API', function() {

	before(function(done) {
		var user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password',
			provider: 'local'
		});

		user.save(done);
	});

	after(function(done) {
		User.remove().exec();
		done();
	});

	describe('authenticated crete request with', function() {
		var product = {
			name: 'Chai',
			quantityPerUnit: '10 boxes x 20 bags',
			unitPrice: 18,
			unitsInStock: 39,
			unitsOnOrder: 0,
			discontinued: false
		};

		var category = {
			name: 'Beverages',
			description: 'Soft drinks, coffees, teas, beers, and ales'
		};

		describe('valid product', function(done) {

			var response = {};

			before(function(done) {
				categoryApi.create(category, function(catRes) {
					category = catRes.body;
					product.category = category._id;
					productApi.create(product, function(prodRes) {
						response = prodRes;
						done();
					});
				});
			});

			it('returns success status', function() {
				response.statusCode.should.equal(201);
			});

			it('returns product details including new id', function() {
				response.body.should.have.property('_id');
				
				for (var property in product) {
					response.body.should.have.property(property, product[property]);
				}
			});

			it('is saved in database', function(done) {	
				productApi.get(response.body._id, function(res) {
					res.statusCode.should.equal(200);
					response.body.should.have.property('_id', response.body._id);
					for (var property in product) {
						response.body.should.have.property(property, product[property]);
					}
					done();
				});
			});

			after(function(done) {
				productApi.clear(categoryApi.clear(done));
			});
		});

		describe('empty name', function() {

			var response = {};
			var product = {
				quantityPerUnit: '10 boxes x 20 bags',
				unitPrice: 18,
				unitsInStock: 39,
				unitsOnOrder: 0,
				discontinued: false
			};

			before(function(done) {
				productApi.create(product, function(res) {
					response = res;
					done();
				});
			});

			it('returns invalid status', function() {
				response.statusCode.should.equal(400);
			});
			it('returns validation message', function() {
				response.body.message.should.equal('name cannot be blank');
			});
		});

		describe('name longer than 40 chars in length', function() {

			var response = {};
			var product = {
				name: 'Soft drinks, coffees, teas, beers, and ales'
			};

			before(function(done) {
				productApi.create(product, function(res) {
					response = res;
					done();
				});
			});

			it('returns invalid status', function() {
				response.statusCode.should.equal(400);
			});
			it('returns validation message', function() {
				response.body.message.should.equal('name must be 40 chars in length or less');
			});
		});
	});

	describe('authenticated get request with', function() {

		describe('no parameters', function() {
			var products = [];

			before(function(done) {
				productApi.create({ name: 'Chai' }, function() {
					productApi.create({ name: 'Boston Crab Meat' }, function () {
						productApi.create({ name: 'Aniseed Syrup' }, function () {
							productApi.list(function(res) {
								products = res.body;
								done();
							});
						});
					});
				});
			});

			it('lists all products in alphabetical order', function() {
				products.should.have.length(3);
				products[0].name.should.equal('Aniseed Syrup');
				products[1].name.should.equal('Boston Crab Meat');
				products[2].name.should.equal('Chai');
			});

			after(function(done) {
				productApi.clear(categoryApi.clear(done));
			});
		});

		describe('valid product id', function() {

			var response = {};
			var product = {};

			before(function(done) {
				productApi.create({ name: 'Aniseed Syrup' }, function (p) {
					product = p.body;
					productApi.get(product._id, function(res) {
						response = res;
						done();
					});
				});
			});

			it('returns success status', function() {
				response.statusCode.should.equal(200);
			});

			it('returns the expected product', function() {
				response.body._id.should.equal(product._id);
				response.body.name.should.equal(product.name);
			});

			after(function(done) {
				productApi.clear(categoryApi.clear(done));
			});
		});

		describe('invalid product id', function() {
			var response = {};

			before(function(done) {
				productApi.get('54c53e9171fde48e4a16008e', function(res) {
					response = res;
					done();
				});
			});

			it('returns not found status', function() {
				response.statusCode.should.equal(404);
			});
		});
	});

	describe('authenticated update request with', function() {
		
		var product = {
			name: 'Chai'
		};

		var product2 = {
			name: 'Boston Crab Meat'
		};

		before(function(done) {
			productApi.create(product, function(res) {
				product = res.body;
				productApi.create(product2, function(res2) {
					product2 = res2.body;
					done();	
				});
			});
		});

		describe('valid product', function() {

			var response = {};

			before(function(done) {
				product.name = 'Aniseed Syrup';
				productApi.update(product, function(res) {
					response = res;
					done();
				});
			});

			it('returns success status', function() {
				response.statusCode.should.equal(200);
			});

			it('returns product details', function() {
				response.body._id.should.equal(product._id);
				response.body.name.should.equal(product.name);
			});

			it('is updated in database', function(done) {
				productApi.get(product._id, function(res) {
					res.statusCode.should.equal(200);
					res.body.should.have.property('name', product.name);
					done();
				});
			});

			it('only updates specified record', function(done) {
				productApi.get(product2._id, function(res) {
					res.statusCode.should.equal(200);
					res.body.should.have.property('name', product2.name);
					done();
				});
			});
		});

		describe('empty product name', function() {
			
			var response = {};

			before(function(done) {
				product.name = '';
				productApi.update(product, function(res) {
					response = res;
					done();
				});
			});

			it('returns invalid status', function() {
				response.statusCode.should.equal(400);
			});

			it('returns validation message', function() {
				response.body.message.should.equal('name cannot be blank');
			});
		});

		describe('product name longer than 40 chars in length', function() {

			var response = {};

			before(function(done) {
				product.name = 'Soft drinks, coffees, teas, beers, and ales';
				productApi.update(product, function(res) {
					response = res;
					done();
				});
			});

			it('returns invalid status', function() {
				response.statusCode.should.equal(400);
			});

			it('returns validation message', function() {
				response.body.message.should.equal('name must be 40 chars in length or less');
			});
		});

		after(function(done) {
			productApi.clear(categoryApi.clear(done));
		});
	});

	describe('authenticated delete request with', function() {

		var products = [];

		before(function(done) {
			productApi.create({ name: 'Aniseed Syrup' }, function() {
				productApi.create({ name: 'Boston Crab Meat' }, function () {
					productApi.create({ name: 'Chai' }, function () {
						productApi.list(function(res) {
							products = res.body;
							done();
						});
					});
				});
			});
		});

		describe('valid product id', function() {

			var response = {};

			before(function(done) {
				productApi.delete(products[1]._id, function(res) {
					response = res;
					done();	
				});
			});

			it('returns success status', function() {
				response.statusCode.should.equal(200);
			});

			it('returns product details', function() {
				response.body._id.should.equal(products[1]._id);
				response.body.name.should.equal(products[1].name);
			});

			it('is deleted from database', function(done) {
				productApi.get(products[1]._id, function(res) {
					res.statusCode.should.equal(404);
					productApi.list(function(listRes) {
						listRes.body.length.should.equal(2);
						done();
					});
				});
			});
		});

		describe('invalid product id', function() {

			var response = {};

			before(function(done) {
				productApi.delete('54c53e9171fde48e4a16008e', function(res) {
					response = res;
					done();	
				});
			});

			it('returns not found status', function() {
				response.statusCode.should.equal(404);
			});
		});

		after(function(done) {
			productApi.clear(categoryApi.clear(done));
		});
	});
});
