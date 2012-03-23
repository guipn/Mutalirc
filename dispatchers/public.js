var pub = exports,
    irc = require('../irc.js'),
    rfc = require('../ietf.js'),
    utl = require('../util.js'),
    gbk = require('../gbooks.js');



pub.gbooks = function (tokens, packet) {

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

pub.gbooks.restricted = true;



pub.rfc = function(tokens, packet) {
    
    tokens.shift();
    rfc.search(tokens.join(' '), function (link) {

	var msg = utl.interp('{who}: {lnk}',
			     {
				 who: packet.sender,
				 lnk: link
			     });

	packet.network.send(
	    irc.outbound.say(packet.channel, msg)
	);
    });
};

pub.rfc.restricted = false;



pub.quit = function (tokens, packet) {

    var quitmsg = tokens[1] || "";

    console.log('Quitting by order of ' + packet.sender);
    packet.network.send(irc.outbound.quit(quitmsg));
    process.exit();
    console.log(e.message);
};

pub.quit.restricted = true;



pub.join = function (tokens, packet) {

    packet.network.send(irc.outbound.join(tokens[1]));

};

pub.join.restricted = true;



pub.part = function (tokens, packet) {

    if (tokens[1]) {
	packet.network.send(irc.outbound.part(tokens[1]));
    }
    else if (packet.channel) {
	packet.network.send(irc.outbound.part(packet.channel));
    }
};

pub.part.restricted = true;



pub.ignore = function (tokens, packet) {

    packet.ignored[tokens[1]] = true;
    packet.network.send(irc.outbound.say(packet.sender, 'Ignoring ' + 
					 tokens[1] + '.'));
};

pub.ignore.restricted = true;



pub.unignore = function (tokens, packet) {
    delete(packet.ignored[tokens[1]]);

    packet.network.send(
	    irc.outbound.say(
		packet.sender, 
    		tokens[1] + ' is no longer being ignored.'
	    )
    );
};

pub.unignore.restricted = true;
