var pub = exports,
    irc = require('../irc.js'),
    utl = require('../util.js'),
    rfc = require('./modules/ietf.js'),
    gbk = require('./modules/gbooks.js');



pub.gbooks = function (tokens, context) {

    var opt = context.options;

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

	context.network.send(
	    irc.outbound.say(context.channel, context.sender + ': ' + msg)
	);	
    }

    tokens.shift();

    gbk.getAPIKey(opt.gBooksAPIKey, function (key) {
	gbk.search(key, tokens.join(' '), sendBookResult);
    });

};

pub.gbooks.restricted = true;



pub.rfc = function(tokens, context) {
    
    tokens.shift();
    rfc.search(tokens.join(' '), function (link) {

	var msg = utl.interp('{who}: {lnk}',
			     {
				 who: context.sender,
				 lnk: link
			     });

	context.network.send(
	    irc.outbound.say(context.channel, msg)
	);
    });
};

pub.rfc.restricted = false;



pub.quit = function (tokens, context) {

    var quitmsg = tokens[1] || "";

    console.log('Quitting by order of ' + context.sender);
    context.network.send(irc.outbound.quit(quitmsg));
    process.exit();
    console.log(e.message);
};

pub.quit.restricted = true;



pub.join = function (tokens, context) {

    context.network.send(irc.outbound.join(tokens[1]));

};

pub.join.restricted = true;



pub.part = function (tokens, context) {

    if (tokens[1]) {
	context.network.send(irc.outbound.part(tokens[1]));
    }
    else if (context.channel) {
	context.network.send(irc.outbound.part(context.channel));
    }
};

pub.part.restricted = true;



pub.ignore = function (tokens, context) {

    context.ignored[tokens[1]] = true;
    context.network.send(irc.outbound.say(context.sender, 'Ignoring ' + 
					 tokens[1] + '.'));
};

pub.ignore.restricted = true;



pub.unignore = function (tokens, context) {
    delete(context.ignored[tokens[1]]);

    context.network.send(
	    irc.outbound.say(
		context.sender, 
    		tokens[1] + ' is no longer being ignored.'
	    )
    );
};

pub.unignore.restricted = true;
