var http = require('http'),
    utl  = require('../../util.js'),
    rfc  = exports;

rfc.search = function (query, callback) {

    var link    = /<a class="l" href="(\S+txt)/i,
	html    =  '',
	options = {
	    host: 'www.googlesyndicatedsearch.com',
	    method: 'GET',
	    path: utl.interp('/u/ietf?q={q}&Search=Search',
			      {
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
		callback(result ? result[1] : 'No results found.');
	    });
	});

    request.end();
}

