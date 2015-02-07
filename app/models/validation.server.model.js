'use strict';

/**
 * Validation - wires into our custom validator function - http://mongoosejs.com/docs/api.html#schematype_SchemaType-validate
 */
module.exports.len = function(max) {
	return function (v) {
		return v.length <= max;
	};
};
