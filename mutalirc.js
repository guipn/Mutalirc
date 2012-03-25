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

function react(data) {

    var text    = data.toString(),
	queries = irc.inbound,
	resp    = irc.outbound,
	success;

    if ( success = text.match(queries.ping()) ) {

	nwk.send(resp.ping(success[1])); 

    } else if ( success = text.match(queries.version(opt.nick)) ) {
	
	nwk.send(resp.version(success[1], opt.version)); 

    } else if ( success = text.match(queries.privmsg(opt.nick)) ) {

	handleMessage('query', {
	    sender:   success[1],
	    hostmask: success[2],
	    message:  success[3],
	    network:  nwk,
	    options:  opt,
	    ignored:  ignored
	});

    } else if ( success = text.match(queries.publicmsg()) ) {

	handleMessage('public', {
	    sender:   success[1],
	    hostmask: success[2],
	    channel:  success[3],
	    message:  success[4],
	    network:  nwk,
	    options:  opt,
	    ignored:  ignored
	});

    } 

    console.log(text);
}


function handleMessage(dispatcher, context) {

    if (ignoring(context.sender) || ignoring(context.hostmask)) {
	console.log('Ignoring query from ' + context.hostmask);
	return;
    }
    
    cmd.dispatch(dispatcher, context); 
}
