var irc      = require('./irc.js'),
    gbk      = require('./gbooks.js'),
    utl      = require('./util.js'),
    cmd      = exports,
    authd    = {}; // People authentified

cmd.prefix = /^\./;
cmd.pub    = {};
cmd.priv   = {};


function tokenize(msg) {

    return msg.slice(1).split(/\s/);

}


cmd.dispatch = function (packet, dispatcher) {
    
    var tokens = tokenize(packet.message),
	name   = tokens[0];
    
    if (typeof dispatcher[name] === 'undefined') {
	return;
    }

    if (dispatcher[name].restricted === false) {
	dispatcher[name](tokens, packet);
    } 
    else if (typeof authd[packet.hostmask] !== 'undefined') {
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
	authd[packet.hostmask] = true;

	packet.network.send(
	    irc.outbound.say(packet.sender, 'You are now authentified.')
	);
    }
};

cmd.priv.auth.restricted = false;



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

    tokens.shift();

    gbk.getAPIKey(opt.gBooksAPIKey, function (key) {
	gbk.search(key, tokens.join(' '), sendBookResult);
    });

};

cmd.pub.gbooks.restricted = true;



cmd.pub.quit = cmd.priv.quit = function (tokens, packet) {

    var quitmsg = tokens[1] || "";

    console.log('Quitting by order of ' + packet.sender);
    packet.network.send(irc.outbound.quit(quitmsg));
    process.exit();
    console.log(e.message);
};

cmd.pub.quit.restricted = true;



cmd.pub.join = cmd.priv.join = function (tokens, packet) {

    packet.network.send(irc.outbound.join(tokens[1]));

};

cmd.pub.join.restricted  = true;
cmd.priv.join.restricted = true;



cmd.pub.part = cmd.priv.part = function (tokens, packet) {

    if (tokens[1]) {
	packet.network.send(irc.outbound.part(tokens[1]));
    }
    else if (packet.channel) {
	packet.network.send(irc.outbound.part(packet.channel));
    }
};

cmd.pub.part.restricted  = true;
cmd.priv.part.restricted = true;



cmd.pub.ignore = cmd.priv.ignore = function (tokens, packet) {

    packet.ignored[tokens[1]] = true;
    packet.network.send(irc.outbound.say(packet.sender, 'Ignoring ' + 
					 tokens[1] + '.'));
};

cmd.pub.ignore.restricted  = true;
cmd.priv.ignore.restricted = true;

