var https  = require('https'),
    fs     = require('fs'),
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

    var JSONResponse = '',
	qArg         = query.split(/\s/).join('+'),
	options      = {
	    host:   'www.googleapis.com',
	    method: 'GET',
	    path:   '/books/v1/volumes?q=' + qArg +
		    '&key=' + APIKey + 
		    '&maxResults=1&printType=books&filter=partial'
	};

    console.log('https://' + options.host + options.path);

    var request = https.request(options, function (response) {
	response.setEncoding('utf8');
	response.on('data', function (data) {
	    JSONResponse += data;
	});
	response.on('end', function () {
	    callback(parse(JSONResponse));
	});
    });

    request.end();

};
