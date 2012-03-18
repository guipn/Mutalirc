var irc      = require('./irc.js'),
    gbk      = require('./gbooks.js'),
    cmd      = exports,
    authdOps = {};

cmd.prefix = /^\./;
cmd.pub    = {};
cmd.priv   = {};



function notSuperUser(hostmask) {

    return typeof authdOps[hostmask] !== 'undefined';
    
}

function tokenize(msg) {

    return msg.slice(1).split(/\s/);

}


cmd.dispatch = function (packet, dispatcher) {
    
    var tokens = tokenize(packet.message),
	name   = tokens[0];

    if (typeof dispatcher[name] !== 'undefined') {
	dispatcher[name](tokens, packet);
    }

};



cmd.priv.auth = function (tokens, packet) {
    
    if (typeof packet.options.operators[packet.sender] === 'undefined') {
	return;
    }
    
    if (packet.options.operators[packet.sender] !== tokens[1]) {
	config.network.send(irc.outbound.say(packet.sender, 'Invalid password.'));
    }
    else {
	authdOps[packet.hostmask] = true;
	packet.network.send(irc.outbound.say(packet.sender, 'You are now authentified.'));
    }
};


cmd.pub.gbooks = function (tokens, packet) {

    var opt = packet.options;

    if (notSuperUser(packet.hostmask)) {
	return;
    }

    tokens.shift();

    gbk.getAPIKey(opt.gBooksAPIKey, function (key) {
	console.log('Api key: ' + key);
	gbk.search(key, tokens.join(' '), function (book) {
	    var msg = book ? 
			'"'        + book.title                 + '"' +
			' - '      + book.authors.join(', ')          +
			'; '       + book.pageCount      + ' pages; ' +
			'Rating: ' + book.avgRating                   +
			' ('       + book.ratingsCount + ' ratings).' +
			' '        + book.link + '.' 
			: 'No results found on Google Books.';

	    packet.network.send(
		irc.outbound.say(packet.channel, packet.sender + ': ' + msg)
	    );
	});
    });

};


cmd.pub.quit = cmd.priv.quit = function (tokens, packet) {

    if (notSuperUser(packet.hostmask)) {
	return;
    }

    var quitmsg = tokens[1] || "";

    console.log('Quitting by order of ' + packet.sender);
    packet.network.send(irc.outbound.quit(quitmsg));
    process.exit();
    console.log(e.message);
};

