var qry = exports,
    irc = require('../irc.js'),
    rfc = require('./modules/ietf.js');



qry.load = function (tokens, packet) {

    packet.cmd.load(tokens[1], packet);

    packet.network.send(
	irc.outbound.say(packet.sender,
			 'Dispatcher loaded.')
    );

};

qry.load.restricted = true;



qry.auth = function (tokens, packet) {

    var correctPass = packet.options.operators[packet.sender];
    
    if (typeof packet.options.
	    operators[packet.sender] === 'undefined') {
	return;
    }
    
    if (tokens[1] !== correctPass) {
	packet.network.send(
	    irc.outbound.say(packet.sender, 'Invalid password.')
	);
    }
    else {
	packet.authd[packet.hostmask] = true;

	packet.network.send(
	    irc.outbound.say(packet.sender, 'You are now authentified.')
	);
    }
};

qry.auth.restricted = false;



qry.rfc = function(tokens, packet) {
    
    tokens.shift();
    rfc.search(tokens.join(' '), function (link) {
	packet.network.send(
	    irc.outbound.say(packet.sender, link)
	);
    });
};

qry.rfc.restricted = false;



qry.join = function (tokens, packet) {

    packet.network.send(irc.outbound.join(tokens[1]));

};

qry.join.restricted = true;



qry.part = function (tokens, packet) {

    if (tokens[1]) {
	packet.network.send(irc.outbound.part(tokens[1]));
    }
    else if (packet.channel) {
	packet.network.send(irc.outbound.part(packet.channel));
    }
};

qry.part.restricted = true;



qry.quit = function (tokens, packet) {

    var quitmsg = tokens[1] || "";

    console.log('Quitting by order of ' + packet.sender);
    packet.network.send(irc.outbound.quit(quitmsg));
    process.exit();
    console.log(e.message);
};

qry.quit.restricted = true;



qry.ignore = function (tokens, packet) {

    packet.ignored[tokens[1]] = true;
    packet.network.send(irc.outbound.say(packet.sender, 'Ignoring ' + 
					 tokens[1] + '.'));
};

qry.ignore.restricted = true;



qry.unignore = function (tokens, packet) {
    delete(packet.ignored[tokens[1]]);

    packet.network.send(
	    irc.outbound.say(
		packet.sender, 
    		tokens[1] + ' is no longer being ignored.'
	    )
    );
};

qry.unignore.restricted = true;



qry.say = function (tokens, packet) {

    var where = tokens[1],
	what  = tokens[2];

    packet.network.send(irc.outbound.say(where, what));

};

qry.say.restricted = true;
