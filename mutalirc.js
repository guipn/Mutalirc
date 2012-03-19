var nwk = require('./network.js'),
    cfg = require('./config.js'),
    cmd = require('./commands.js'),
    irc = require('./irc.js'),
    utl = require('./util.js'),
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

    if (ignoring(packet.sender) || ignoring(packet.hostmask)) {
	console.log('Ignoring query from ' + packet.hostmask);
	return;
    }

    packet.network = nwk;
    packet.options = opt;
    packet.ignored = ignored;

    cmd.dispatch(packet, cmd.prv);
}


function handlePublic(packet) {

    if (ignoring(packet.sender) || ignoring(packet.hostmask)) {
	console.log(utl.interp('Ignoring message from {hmask} on {chan}.',
			       {
				   hmask: packet.hostmask,
				   chan:  packet.channel
			       }));
	return;
    }

    packet.network = nwk;
    packet.options = opt;
    packet.ignored = ignored;
    
    cmd.dispatch(packet, cmd.pub);

}
