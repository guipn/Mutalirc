var nwk = require('./network.js'),
    cfg = require('./config.js'),
    cmd = require('./commands.js'),
    irc = require('./irc.js'),
    opt,
    ignored = {};


// Entry point
cfg.read(init);


function ignoring(nickOrHostmask) {
    return typeof ignored[nickOrHostmask] !== 'undefined';
}

function init(options) {
    opt = options;

    opt.ignore.forEach(function (nickOrHostmask) {
	ignored[nickOrHostmask] = true;
    });

    nwk.connect(opt, react);
}


function getmatch(target, tries) {

    var test, i;

    for (i = 0; i < tries.length; i++) {
	if (test = target.match(tries[i])) {
	    return test[0];
	}
    }

    return 'unknown';
}


function react(data) {

    var text    = data.toString(),
	queries = irc.inbound,
	resp    = irc.outbound,
	action,
	reactions;

    console.log(text);

    reactions = {

	PING:    function (text) {
		     var matches = text.match(queries.ping());
		     nwk.send(resp.ping(matches[1]));
	         },

	VERSION: function (text) {
		     var matches = text.match(queries.privmsg(opt.nick));
		     nwk.send(resp.version(matches[1], opt.version));
		 },

	PRIVMSG: function (text) {
		     var matches,
			 context = {
			    network:  nwk,
			    options:  opt,
			    ignored:  ignored
			 };

		     if (matches = text.match(queries.privmsg(opt.nick))) {
			 context.message    = matches[3];
			 context.dispatcher = 'query';
		     }
		     else if (matches = text.match(queries.publicmsg())) {
			 context.channel    = matches[3];
			 context.message    = matches[4];
			 context.dispatcher = 'public';
		     }
		     else {
			 return;
		     }

		     context.sender   = matches[1];
		     context.hostmask = matches[2];

		     if (ignoring(context.sender) || ignoring(context.hostmask)) {
			 console.log('Ignoring message from ' + context.hostmask);
			 return;
		     }

		     cmd.dispatch(context);
		 }
    };

    action = getmatch(text, Object.getOwnPropertyNames(reactions));

    if (typeof reactions[action] !== 'undefined') {
	reactions[action](text);
    }
}
