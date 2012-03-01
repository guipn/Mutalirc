var nwk = require('./network.js'),
    cfg = require('./config.js'),
    cmd = require('./commands.js'),
    irc = require('./irc.js'),
    opt;


function init(options) {
    opt = options;
    nwk.connect(options, react);
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
    // console.log('<' + packet.sender + '> ' + packet.message);
    packet.network = nwk;
    packet.options = opt;
    cmd.runPrivate(packet);
}


function handlePublic(packet) {

    if (packet.message.match(cmd.cmdre) !== null) {
	packet.network = nwk;
	cmd.runPublic(packet);
    }

    // console.log(packet.channel + ' <' + packet.sender +
    //		'> ' + packet.message);

}

// Entry point
cfg.read(init);
