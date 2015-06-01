'use strict';

// Products controller
angular.module('products').controller('ProductsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Products', 'Categories', '$filter',
	function($scope, $stateParams, $location, Authentication, Products, Categories, $filter) {
		$scope.authentication = Authentication;
		$scope.categories = Categories.query();
		$scope.currentPage = 1;
		$scope.pageSize = 10;
		$scope.offset = 0;

		// Page changed handler
		$scope.pageChanged = function() {
			$scope.offset = ($scope.currentPage - 1) * $scope.pageSize;
		};

		// Create new Product
		$scope.create = function() {
			var product = new Products ({
				name: this.name,
				category: this.category,
				quantityPerUnit: this.quantityPerUnit,
				unitPrice: this.unitPrice,
				unitsInStock: this.unitsInStock,
				unitsOnOrder: this.unitsOnOrder
			});

			// Redirect after save
			product.$save(function(response) {
				$location.path('products/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Product
		$scope.remove = function(product) {
			if ( product ) {
				product.$remove();

				for (var i in $scope.products) {
					if ($scope.products [i] === product) {
						$scope.products.splice(i, 1);
					}
				}
			} else {
				$scope.product.$remove(function() {
					$location.path('products');
				});
			}
		};

		// Update existing Product
		$scope.update = function() {
			var product = $scope.product;
			product.category = product.category._id;

			product.$update(function() {
				$location.path('products/' + product._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		var appendCategory = function appendCategory(p) {
			// You could substitue use of filter here with underscore etc.
			p.category = $filter('filter')($scope.categories, {_id: p.category})[0];
		};

		// Find a list of Products
		$scope.find = function() {
			Products.query(function loadedProducts(products) {
				products.forEach(appendCategory);
				$scope.products = products;
			});
		};

		// Find existing Product
		$scope.findOne = function() {
			$scope.product = Products.get({
				productId: $stateParams.productId
			}, appendCategory);
		};

		// Search for a product
		$scope.productSearch = function(product) {
			$location.path('products/' + product._id);
		};
	}
]);
