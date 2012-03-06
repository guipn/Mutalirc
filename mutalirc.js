var nwk = require('./network.js'),
    cfg = require('./config.js'),
    cmd = require('./commands.js'),
    irc = require('./irc.js'),
    opt,
    ignored = {};


function init(options) {
    opt = options;
    nwk.connect(opt, react);
}

function isIgnored(nickOrHostmask) {
    return typeof ignored[nickOrHostmask] !== 'undefined';
}


function react(data) {

    var text    = data.toString(),
	queries = irc.inbound,
	resp    = irc.outbound,
	success;

    opt.ignore.forEach(function (nickOrHostmask) {
	ignored[nickOrHostmask] = true;
    });

    // The below looks terrible. I'm thinking of alternatives
    // and open to receiving suggestions. I got to the following 
    // but found it to be cumbersome:
    //
    // (success = text.match(queries.ping())) &&
    // (function () { nwk.send(resp.ping(success[1]); }());
    // 
    // ...

    if ( success = text.match(queries.ping()) ) {

	nwk.send(resp.ping(success[1])); 

    } else if ( success = text.match(queries.version(opt.nick)) ) {
	
	nwk.send(resp.version(success[1], opt.version)); 

    } else if ( success = text.match(queries.privmsg(opt.nick)) ) {

	handlePrivate({
	    hostmask: success[2],
	    sender:   success[1],
	    message:  success[3]
	});

    } else if ( success = text.match(queries.publicmsg()) ) {

	handlePublic({
	    channel:  success[3],
	    hostmask: success[2],
	    sender:   success[1],
	    message:  success[4]
	});

    } 

    console.log(text);
}


function handlePrivate(packet) {

    if (isIgnored(packet.sender) || isIgnored(packet.hostmask)) {
	console.log('Ignoring query from ' + packet.hostmask);
	return;
    }

    packet.network = nwk;
    packet.options = opt;
    cmd.runPrivate(packet);
}


function handlePublic(packet) {

    if (isIgnored(packet.sender) || isIgnored(packet.hostmask)) {
	console.log('Ignoring message from ' + packet.hostmask +
		    ' on ' + packet.channel);
	return;
    }

    if (packet.message.match(cmd.cmdre) !== null) {
	packet.network = nwk;
	cmd.runPublic(packet);
    }

}

// Entry point
cfg.read(init);
