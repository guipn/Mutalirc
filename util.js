// Random goodness.

var util = exports;


// Crockford is not all dogma.

util.interp =  function (str, hash) {

    var interpolated = str,
	ownKeys      = Object.getOwnPropertyNames(hash);

    ownKeys.forEach(function (key) {
	interpolated = interpolated.
			replace('{' + key + '}', hash[key]);
    });
    
    return interpolated;
};

