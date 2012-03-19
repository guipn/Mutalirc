var irc      = require('./irc.js'),
    gbk      = require('./gbooks.js'),
    utl      = require('./util.js'),
    cmd      = exports,
    authdOps = {};

cmd.prefix = /^\./;
cmd.pub    = {};
cmd.priv   = {};



function notSuperUser(hostmask) {

    return typeof authdOps[hostmask] === 'undefined';
    
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

    var correctPass = packet.options.operators[packet.sender];
    
    if (typeof packet.options.
		operators[packet.sender] === 'undefined') {
	return;
    }
    
    if (tokens[1] !== correctPass) {
	config.network.send(
	    irc.outbound.say(packet.sender, 'Invalid password.')
	);
    }
    else {
	authdOps[packet.hostmask] = true;

	packet.network.send(
	    irc.outbound.say(packet.sender, 'You are now authentified.')
	);
    }
};


cmd.pub.gbooks = function (tokens, packet) {

    var opt = packet.options;

    function sendBookResult(book) {
	var msg = book ? 
		utl.interp('"{title}" - {authors}; Rating: {rating} ' +
			   '({ratings}); {pages} pages; {link}',
			    {
				title:   book.title, 
				authors: book.authors.join(', '),
				rating:  book.avgRating, 
				ratings: book.ratingsCount,
				pages:   book.pageCount, 
				link:    book.link
			    }) :
		'No results found on Google Books.';

	packet.network.send(
	    irc.outbound.say(packet.channel, packet.sender + ': ' + msg)
	);	
    }

    if (notSuperUser(packet.hostmask)) {
	return;
    }

    tokens.shift();

    gbk.getAPIKey(opt.gBooksAPIKey, function (key) {
	gbk.search(key, tokens.join(' '), sendBookResult);
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

cmd.pub.join = cmd.priv.join = function (tokens, packet) {

    if (notSuperUser(packet.hostmask)) {
	return;
    }

    packet.network.send(irc.outbound.join(tokens[1]));

};

cmd.pub.part = cmd.priv.part = function (tokens, packet) {

    if (notSuperUser(packet.hostmask)) {
	return;
    }

    if (tokens[1]) {
	packet.network.send(irc.outbound.part(tokens[1]));
    }
    else if (packet.channel) {
	packet.network.send(irc.outbound.part(packet.channel));
    }
};

