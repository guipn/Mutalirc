var nwk = require('./network.js'),
    cfg = require('./config.js'),
    cmd = require('./commands.js'),
    irc = require('./irc.js'),
    log = require('./log.js'),
    opt,
    ignored = {};


cfg.read(init);


function ignoring(nickOrHostmask) {
    return typeof ignored[nickOrHostmask] !== 'undefined';
}

function init(options) {
    opt = options;

    opt.ignore.forEach(function (nickOrHostmask) {
	ignored[nickOrHostmask] = true;
    });

    log.setDir(opt.logDir);

    nwk.connect(opt, react);
}


function react(data) {

    var parsed = irc.process(data.toString(), opt),
	resp   = irc.outbound;

    switch (parsed.ircCmd) {

	case 'ping':
	    nwk.send(resp.pong(parsed.content));
	    log.debug({message: 'PONG: ' + parsed.content});
	    break;

	case 'version':
	    nwk.send(resp.version(parsed.requester, opt.version));
	    log.debug({
		message: 'Providing version information to: ' + parsed.requester
	    });
	    break;

	case 'privmsg':
	    void function () {

		var context = {
		    sender:     parsed.sender,
		    hostmask:   parsed.hostmask,
		    message:    parsed.message,
		    dispatcher: 'query',
		    network:    nwk,
		    options:    opt     
		};

		if (ignoring(parsed.sender) || ignoring(parsed.hostmask)) {
		    log.debug({
			message: 'Ignoring query from ' + parsed.hostmask
		    });
		    return;
		}

		log.queryIn({
		    sender:  context.sender,
		    message: context.message
		});
		
		cmd.dispatch(context);
	    }(); 
	    break;

	case 'publicmsg':
	    void function () {
		var context = {
		    sender:     parsed.sender,
		    hostmask:   parsed.hostmask,
		    channel:    parsed.channel,
		    message:    parsed.message,
		    dispatcher: 'public',
		    network:    nwk,
		    options:    opt     
		};

		if (ignoring(parsed.sender) || ignoring(parsed.hostmask)) {
		    log.debug({
			message: 'Ignoring message from ' + parsed.hostmask
		    });
		    return;
		}

		log.publicMsgIn({
		    message: context.message,
		    channel: context.channel,
		    sender:  context.sender
		});
		
		cmd.dispatch(context);
	    }();
	    break;

	default:
	    console.log('-- Undefined reaction.');
    }
}
