var urband   = module.exports,
    http     = require('http'),
    resultRE = /<meta\scontent='(.+)'\sname='Description'\s\/>/i;

function search(query, callback) {

    var options = {
	    host:   'urbandictionary.com',
	    port:   '80',
	    method: 'GET',
	    path:   '/define.php?term=' + query,
	    referer: this.host + this.path
	},
	rawContent = '',
	req = http.request(options, function (response) {
	    response.setEncoding('utf8');
	    response.on('data', function (data) {
		rawContent += data;
	    });
	    response.on('end', function () {
		var result = rawContent.match(resultRE);
		console.log(rawContent + '\n------------');
		callback(result ? result[0] : null);
	    });
	});
    req.end();
}


function printResult(result) {
    if (result) {
	console.log('The result is: ' + result);
    }
    else {
	console.log('Did not find results.');
    }
}


search('lol', printResult);


