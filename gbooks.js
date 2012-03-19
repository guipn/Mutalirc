var https  = require('https'),
    fs     = require('fs'),
    interp = require('./util.js').interp,
    gbooks = module.exports;


function parse(response) {

    var result = JSON.parse(response),
	volume,
	book;

    if (result.totalItems == 0) {
	return null;
    }

    if (typeof result.items === 'undefined') {
	return;
    }

    volume = result.items[0].volumeInfo;
    book   = {};

    book.authors = [];

    volume.authors.forEach(function (v) {
	book.authors.push(v);
    });

    book.title        = volume.title;
    book.avgRating    = volume.averageRating;
    book.ratingsCount = volume.ratingsCount;
    book.pageCount    = volume.pageCount;
    book.link         = volume.previewLink ||
		        volume.infoLink;

    return book;
}


gbooks.getAPIKey = function (filename, callback) {
    fs.readFile(filename, 'utf8', function (err, key) {
	if (err) {
	    throw err;
	}
	callback(key.replace(/\n/, ''));
    });
};

gbooks.search = function (APIKey, query, callback) {

    var json    = '',
	options = {
	    host:   'www.googleapis.com',
	    method: 'GET',
	    path:   interp('/books/v1/volumes?q={query}&key={key}' +
			   '&maxResults=1&printType=books&filter=partial',
			   {
			       query: query.split(/\s/).join('+'),
			       key:   APIKey,
			   })
	},
        request = https.request(options, function (response) {
	    response.setEncoding('utf8');
	    response.on('data', function (data) {
		json += data;
	    });
	    response.on('end', function () {
		callback(parse(json));
	    });
	});

    request.end();
};
