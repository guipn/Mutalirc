var fs  = require('fs'),
    log = exports,
    dir = './logs';


log.setDir = function (directory) {

    if (require('path').existsSync(directory)) {
	dir = directory;
    }
    else {
	fs.mkdir(directory, null, function () {
	    console.log('-- Given log directory is invalid and could not ' +
		        'be created. Will use default.');
	});
    }

    
};


log.publicMsgOut = function (params) {
    
    var now  = getTime(),
	path = dir + '/'   + params.channel + '.log',
	line = now + '| <' + params.sender  + '> ' + 
	       params.message;

    append(path, line);
};


log.publicMsgIn = function (params) {
    
    var now  = getTime(),
	path = dir + '/'   + params.channel + '.log',
	line = now + '| <' + params.sender  + '> ' + 
	       params.message;
    
    append(path, line);
};


log.queryOut = function (params) {

    var now  = getTime(),
	path = dir + '/'   + params.destination + '.log',
	line = now + '| <' + params.sender + '> ' + params.message;

    append(path, line);
};


log.queryIn = function (params) {

    var now  = getTime(),
	path = dir + '/'   + params.sender + '.log',
	line = now + '| <' + params.sender + '> ' + params.message;

    append(path, line);
};


log.debug = function (params) {

    var now  = getTime(),
	path = './debug.log',
	line = now + '| ' + params.message;

    console.log('-- ' + params.message);
    append(path, line);

}


log.joined = function (params) {

    var now  = getTime(),
	path = dir + '/'  + params.channel + '.log',
	line = now + '| ' + params.who     + ' joined channel ' + 
	       params.channel + '.';

    append(path, line);
}


log.parted = function (params) {

    var now  = getTime(), 
	path = dir + '/'  + params.channel + '.log',
	line = now + '| ' + params.who     + ' parted channel ' +
	       params.channel + '.';

    append(path, line);
}


log.renamed = function (params) {

    var now  = getTime(),
	path = dir + '/'  + params.channel + '.log',
	line = now + '| ' + params.old     + ' changed nick to ' +
	       params.new_ + '.';

    append(path, line);
}


function getTime() {

    return new Date().toString().match(/[^G]+/);

}

function append(path, line) {

    fs.open(path, 'a', 438, function (err, fd) {

	if (err) {
	    console.log('There was a problem opening the log ' + path + '.');
	}
	
	fs.write(fd, line + '\n', null, 'utf8', function () {
	    fs.close(fd);
	});

    });
}
