var pub    = exports,
    irc    = require('../irc.js'),
    rfc    = require('./modules/ietf.js'),
    gbk    = require('./modules/gbooks.js'),
    interp = require('../util.js').interp;


function reply(context, message) {
    context.network.send(
	irc.outbound.say(context.channel, 
			 context.sender + ': ' + message)
    );
}


function replyQuery(context, message) {
    context.network.send(
	irc.outbound.say(context.sender, message)
    );
}





pub.gbooks = function (tokens, context) {

    var opt = context.options;

    function sendBookResult(book) {
	var msg = book ? 
		interp('"{title}" - {authors}; Rating: {rating} ' +
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

	reply(context, msg);
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
	reply(context, link);
    });
};

pub.rfc.restricted = false;



pub.quit = function (tokens, context) {

    var quitmsg = tokens[1] || "";

    console.log('Quitting by order of ' + context.sender);
    context.network.send(irc.outbound.quit(quitmsg));
    process.exit();
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

    replyQuery(context, interp('Ignoring {who}.', { who: tokens[1] }));
};

pub.ignore.restricted = true;



pub.unignore = function (tokens, context) {
    delete(context.ignored[tokens[1]]);
    replyQuery(context, 
	       interp('{target} unignored.', { target: tokens[1] }));
};

pub.unignore.restricted = true;



pub.load = function (tokens, context) {

    context.cmd.load(tokens[1], context);

    reply(context, 
	interp('Dispatcher \'{d}\' loaded.', { d: tokens[1] })
    );
};

pub.load.restricted = true;



pub.unload = function (tokens, context) {

    reply(context,
	interp('Dispatcher \'{disp}\' {result}loaded.',
	       {
		   disp:   tokens[1],
		   result: context.cmd.unload(tokens[1]) ? 'un' : 'was not '
	       })
    );
};

pub.unload.restricted = true;
