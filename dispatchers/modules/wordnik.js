var wnk   = module.exports,
    https = require('https'),
    fs    = require('fs'),
    qs    = require('querystring'),
    cache = {};
    


function parse(word, response) {

    var results = JSON.parse(response),
	defs    = [];

    results.forEach(function (result) {
	defs.push(result.text);
    });

    cache[word] = defs;
    return defs;
}


wnk.getAPIKey = function (filename, callback) {
    fs.readFile(filename, 'utf8', function (err, key) {
	if (err) {
	    throw err;
	}
	callback(key.replace(/\n/, ''));
    });
};


wnk.define = function (APIKey, word, callback) {

    if (cache[word]) {
	callback(cache[word]);
	return;
    }

    var json    = '',
	options = {
	    host:   'api.wordnik.com',
	    method: 'GET',
	    path:   '/v4/word.json/' + word + '/definitions?' + 
		    qs.stringify({
			includeRelated: false,
			includeTags:    false,
			useCanonical:   false,
			api_key:        APIKey
		    })
	},
        request = https.request(options, function (response) {
	    response.setEncoding('utf8');
	    response.on('data', function (data) {
		json += data;
	    });
	    response.on('end', function () {
		callback(parse(word, json));
	    });
	});

    request.end();
}
