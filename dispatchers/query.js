var qry    = exports,
    irc    = require('../irc.js'),
    rfc    = require('./modules/ietf.js'),
    log    = require('./log.js'),
    interp = require('../util.js').interp;


function reply(context, message) {

    context.network.send(
	irc.outbound.say(context.sender, message)
    );

    log.query({
	sender:  context.sender,
	message: message
    });
}



qry.load = function (tokens, context) {

    try {
	context.cmd.load(tokens[1], context);
	reply(context, 
	    interp('Dispatcher \'{d}\' loaded.', { d: tokens[1] })
	);
    }
    catch (e) {
	reply(context,
	    interp('Error trying to load dispatcher \'{d}\'.', { d: tokens[1] })
	);
    }
};

qry.load.restricted = true;



qry.unload = function (tokens, context) {

    reply(context,
	interp('Dispatcher \'{disp}\' {result}loaded.',
	       {
		   disp:   tokens[1],
		   result: context.cmd.unload(tokens[1]) ? 'un' : 'was not '
	       })
    );
};

qry.unload.restricted = true;



qry.auth = function (tokens, context) {

    var correctPass = context.options.operators[context.sender];
    
    if (typeof context.options.
	    operators[context.sender] === 'undefined') {
	return;
    }
    
    if (tokens[1] !== correctPass) {
	reply(context, 'Invalid password.');
    }
    else {
	context.authd[context.hostmask] = true;
	reply(context, 'You are now authentified.');
    }
};

qry.auth.restricted = false;



qry.rfc = function(tokens, context) {
    
    tokens.shift();
    rfc.search(tokens.join(' '), function (link) {
	reply(context, link);
    });
};

qry.rfc.restricted = false;



qry.join = function (tokens, context) {

    context.network.send(irc.outbound.join(tokens[1]));

};

qry.join.restricted = true;



qry.part = function (tokens, context) {

    if (tokens[1]) {
	context.network.send(irc.outbound.part(tokens[1]));
    }
    else if (context.channel) {
	context.network.send(irc.outbound.part(context.channel));
    }
};

qry.part.restricted = true;



qry.quit = function (tokens, context) {

    var quitmsg = tokens[1] || "";

    log.debug('Quitting by order of ' + context.sender);
    context.network.send(irc.outbound.quit(quitmsg));
    process.exit();
};

qry.quit.restricted = true;



qry.ignore = function (tokens, context) {

    context.ignored[tokens[1]] = true;
    reply(context,
	interp('Ignoring {who}.', { who: tokens[1] })
    );
};

qry.ignore.restricted = true;



qry.unignore = function (tokens, context) {
    delete(context.ignored[tokens[1]]);

    reply(context,
	interp('{target} unignored.', { target: tokens[1] })
    );
};

qry.unignore.restricted = true;



qry.say = function (tokens, context) {

    var where = tokens[1],
	what  = tokens[2];

    context.network.send(irc.outbound.say(where, what));

};

qry.say.restricted = true;
