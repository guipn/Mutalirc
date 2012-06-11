var fs  = require('fs'),
    log = exports,
    dir = './logs';


log.setDir = function (directory) {
    dir = directory;
};


log.publicMsgOut = function (params) {
    
    var now  = getTime();
	path = dir + '/'   + params.channel + '.log',
	line = now + '| <' + params.sender  + '> ' + 
	       params.message + '\n';

    
    append(path, line);
};


log.publicMsgIn = function (params) {
    
    var now  = getTime();
	path = dir + '/'   + params.channel + '.log',
	line = now + '| <' + params.sender  + '> ' + 
	       params.message + '\n';

    
    append(path, line);
};


log.queryOut = function (params) {

    var now  = getTime();
	path = dir + '/'   + params.destination + '.log',
	line = now + '| <' + params.sender + '> ' + params.message;

    append(path, line);
};


log.queryIn = function (params) {

    var now  = getTime();
	path = dir + '/'   + params.sender + '.log',
	line = now + '| <' + params.sender + '> ' + params.message;

    append(path, line);
};


log.debug = function (params) {

    var now  = getTime();
	path = './debug.log',
	line = now + '| ' + params.message;

    console.log('-- ' + params.message);
    append(path, line);

}


log.joined = function (params) {

    var now  = getTime();
	path = dir + '/'  + params.channel + '.log',
	line = now + '| ' + params.who     + ' joined channel ' + 
	       params.channel + '.';

    append(path, line);
}


log.parted = function (params) {

    var now  = getTime(); 
	path = dir + '/'  + params.channel + '.log',
	line = now + '| ' + params.who     + ' parted channel ' +
	       params.channel + '.';

    append(path, line);
}


log.renamed = function (params) {

    var now  = getTime();
	path = dir + '/'  + params.channel + '.log',
	line = now + '| ' + params.old     + ' changed nick to ' +
	       params.new_ + '.';

    append(path, line);
}


function getTime() {

    return new Date().toString().match(/[^G]+/);

}

function append(path, line) {

    console.log(line);

/* 
    fs.open(path, 'a', 438, function (err, fd) {

	var buffer;

	if (err) {
	    console.log('Error trying to log public message.');
	    return;
	}

	buffer = new Buffer('' + line, 'utf8');
	// writeAll(fd, buffer, 0, buffer.length);
	// need ' write ' - check node documentation when on the Internet.

    });
*/
}
