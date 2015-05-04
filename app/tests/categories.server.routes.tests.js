'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	api = require('./models.server.routes.tests.api')(app, 'Category', '/categories/'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

/**
 * Unit tests
 */
describe('Category API', function() {

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

	describe('authenticated create request with', function(done) {

		var category = {
			name: 'Beverages',
			description: 'Soft drinks, coffees, teas, beers, and ales'
		};

		describe('valid category', function(done) {

			var response = {};

			before(function(done) {
				api.create(category, function(res) {
					response = res;
					done();
				});
			});
			
			it('returns success status', function() {
				response.statusCode.should.equal(201);
			});

			it('returns category details including new id', function() {
				response.body.should.have.property('_id');
				response.body.should.have.property('name', category.name);
				response.body.should.have.property('description', category.description);
			});

			it('is saved in database', function(done) {
				api.get(response.body._id, function(res) {
					res.statusCode.should.equal(200);
					res.body.should.have.property('name', category.name);
					res.body.should.have.property('description', category.description);
					done();
				});
			});

			after(function(done) {
				api.clear(done);
			});
		});

		describe('empty name', function() {

			var response = {};

			before(function(done) {
				api.create({ description: 'Drinks' }, function(res) {
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

		describe('name longer than 15 chars in length', function() {

			var response = {};

			before(function(done) {
				api.create({ name : 'Beverages and Drinks' }, function(res) {
					response = res;
					done();
				});
			});

			it('returns invalid status', function() {
				response.statusCode.should.equal(400);
			});

			it('returns validation message', function() {
				response.body.message.should.equal('name must be 15 chars in length or less');
			});
		});

		describe('duplicate name', function() {
			
			var response = {};

			before(function(done) {
				api.create(category, function() {
					// make second call with duplicate name
					api.create(category, function (res) {
						response = res;
						done();
					});
				});
			});

			it('returns invalid status', function() {
				response.statusCode.should.equal(400);
			});

			it('returns validation message', function() {
				response.body.message.should.equal('Name already exists');
			});
		});

		after(function(done) {
			api.clear(done);
		});
	});

	describe('authenticated get request with', function() {

		var categories = [];

		before(function(done) {
			api.create({ name: 'Condiments' }, function() {
				api.create({ name: 'Beverages' }, function () {
					api.create({ name: 'Ales' }, function () {
						api.list(function(res) {
							categories = res.body;
							done();
						});
					});
				});
			});
		});

		describe('no parameters', function() {
			it('lists all categories in alphabetical order', function() {
				categories.should.have.length(3);
				categories[0].name.should.equal('Ales');
				categories[1].name.should.equal('Beverages');
				categories[2].name.should.equal('Condiments');
			});
		});

		describe('valid category id', function() {

			var response = {};

			before(function(done) {
				api.get(categories[0]._id, function(res) {
					response = res;
					done();
				});
			});

			it('returns success status', function() {
				response.statusCode.should.equal(200);
			});

			it('returns the expected category', function() {
				response.body._id.should.equal(categories[0]._id);
				response.body.name.should.equal(categories[0].name);
				response.body.description.should.equal(categories[0].description);
			});
		});

		describe('invalid category id', function() {
			var response = {};

			before(function(done) {
				api.get('54c53e9171fde48e4a16008e', function(res) {
					response = res;
					done();
				});
			});

			it('returns not found status', function() {
				response.statusCode.should.equal(404);
			});
		});

		after(function(done) {
			api.clear(done);
		});
	});

	describe('authenticated update request with', function() {
		
		var category = {
			name: 'Beverages',
			description: 'Soft drinks, coffees, teas, beers, and ales'
		};

		var category2 = {
			name: 'Condiments',
			description: 'Sweet and savory sauces, relishes, spreads, and seasonings'
		};

		before(function(done) {
			api.create(category, function(res) {
				category = res.body;
				api.create(category2, function(res2) {
					category2 = res2.body;
					done();	
				});
			});
		});

		describe('valid category', function() {

			var response = {};

			before(function(done) {
				category.name = 'Drinks';
				category.description = 'Beers and ales';
				api.update(category, function(res) {
					response = res;
					done();
				});
			});

			it('returns success status', function() {
				response.statusCode.should.equal(200);
			});

			it('returns category details', function() {
				response.body._id.should.equal(category._id);
				response.body.name.should.equal(category.name);
				response.body.description.should.equal(category.description);
			});

			it('is updated in database', function(done) {
				api.get(category._id, function(res) {
					res.statusCode.should.equal(200);
					res.body.should.have.property('name', category.name);
					res.body.should.have.property('description', category.description);
					done();
				});
			});

			it('only updates specified record', function(done) {
				api.get(category2._id, function(res) {
					res.statusCode.should.equal(200);
					res.body.should.have.property('name', category2.name);
					res.body.should.have.property('description', category2.description);
					done();
				});
			});
		});

		describe('empty category name', function() {
			
			var response = {};

			before(function(done) {
				category.name = '';
				api.update(category, function(res) {
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

		describe('category name longer than 15 chars in length', function() {

			var response = {};

			before(function(done) {
				category.name = 'Beverages and Drinks';
				api.update(category, function(res) {
					response = res;
					done();
				});
			});

			it('returns invalid status', function() {
				response.statusCode.should.equal(400);
			});

			it('returns validation message', function() {
				response.body.message.should.equal('name must be 15 chars in length or less');
			});
		});

		describe('duplicate category name', function() {
			
			var response = {};

			before(function(done) {
				category.name = 'Condiments';
				api.update(category, function(res) {
					response = res;
					done();
				});
			});

			it('returns invalid status', function() {
				response.statusCode.should.equal(400);
			});

			it('returns validation message', function() {
				response.body.message.should.equal('Name already exists');
			});
		});

		after(function(done) {
			api.clear(done);
		});
	});

	describe('authenticated delete request with', function() {

		var categories = [];

		before(function(done) {
			api.create({ name: 'Condiments' }, function() {
				api.create({ name: 'Beverages' }, function () {
					api.create({ name: 'Ales' }, function () {
						api.list(function(res) {
							categories = res.body;
							done();
						});
					});
				});
			});
		});

		describe('valid category id', function() {

			var response = {};

			before(function(done) {
				api.delete(categories[1]._id, function(res) {
					response = res;
					done();	
				});
			});

			it('returns success status', function() {
				response.statusCode.should.equal(200);
			});

			it('returns category details', function() {
				response.body._id.should.equal(categories[1]._id);
				response.body.name.should.equal(categories[1].name);
				response.body.description.should.equal(categories[1].description);
			});

			it('is deleted from database', function(done) {
				api.get(categories[1]._id, function(res) {
					res.statusCode.should.equal(404);
					api.list(function(listRes) {
						listRes.body.length.should.equal(2);
						done();
					});
				});
			});
		});

		describe('invalid category id', function() {

			var response = {};

			before(function(done) {
				api.delete('54c53e9171fde48e4a16008e', function(res) {
					response = res;
					done();	
				});
			});

			it('returns not found status', function() {
				response.statusCode.should.equal(404);
			});
		});

		after(function(done) {
			api.clear(done);
		});
	});

});
