var fs     = require('fs'),
    config = exports;

config.read = function (callback) {
    fs.readFile('config.json', 'utf8', function (err, data) {
	if (err) {
	    throw err;
	}
	callback(JSON.parse(data));
    });
};

