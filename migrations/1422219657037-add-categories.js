var async = require('async'),
  request = require('request');

var data = [
  { 'name': 'Beverages', 'description': 'Soft drinks, coffees, teas, beers, and ales' },
  { 'name': 'Condiments', 'description': 'Sweet and savory sauces, relishes, spreads, and seasonings' },
  { 'name': 'Confections', 'description': 'Desserts, candies, and sweet breads' },
  { 'name': 'Dairy Products', 'description': 'Cheeses' },
  { 'name': 'Grains/Cereals', 'description': 'Breads, crackers, pasta, and cereal' },
  { 'name': 'Meat/Poultry', 'description': 'Prepared meats' },
  { 'name': 'Produce', 'description': 'Dried fruit and bean curd' },
  { 'name': 'Seafood', 'description': 'Seaweed and fish' }];

exports.up = function(next) {

  async.each(data, function(c, callback) {
    var options = {
        method: 'post',
        body: c,
        json: true,
        url: 'http://localhost:3000/categories',
        auth: {
          user: 'admin',
          pass: 'password'
        }
    };

    request(options, function (err, response) {
      if (response.statusCode == 201) {
        callback();
      } else {
        callback(err);
      }
    });
  }, function(err) {
    if (err) {
      next(err);
    } else {
      next();
    }
  });
};

exports.down = function(next) {
  next();
};
