var http  = require('http'),
    qs    = require('querystring'),
    rfc   = exports,
    cache = {};

rfc.search = function (query, callback) {

    if (cache[query]) {
	callback(cache[query]);
	return;
    }

    var link    = /<a class="l" href="(\S+txt)/i,
	html    =  '',
	options = {
	    host: 'www.googlesyndicatedsearch.com',
	    method: 'GET',
	    path:   '/u/ietf?' +
		    qs.stringify({
      			q: query.split(/\s/).join('+')
		    })
	},
	request = http.request(options, function (response) {
	    response.setEncoding('utf8');
	    response.on('data', function (data) {
		html += data;
	    });
	    response.on('end', function() {

		var result = html.match(link);

		if (result) {
		    cache[query] = result[1];
		    callback(result[1]);
		}
		else {
		    callback('No results found.');
		}
	    });
	});

    request.end();
}

