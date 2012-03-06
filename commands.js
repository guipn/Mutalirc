var irc      = require('./irc.js'),
    cmd      = exports,
    authdOps = {};

cmd.cmdre = /^\./;



function ensureOp(hostmask) {
    if (typeof authdOps[hostmask] === 'undefined') {
	throw { message: hostmask + ' is not authentified as an operator.' };
    }
}

function tokenize(msg) {
    return msg.slice(1).split(/\s/);
}



// { sender, hostmask, message, network, options }

cmd.runPrivate = function (packet) {
    
    var tokens = tokenize(packet.message),
	name   = tokens[0];

    switch (name) {

	case 'greet':  greet({
			  isPublic: false,
			  who:      packet.sender,
			  network:  packet.network
		      }); break;

	case 'auth':   auth({
			   who:       packet.sender,
			   hostmask:  packet.hostmask,
			   pwTry:     tokens[1],
			   network:   packet.network,
			   operators: packet.options.operators
		       }); break;

	case 'quit':   quit({
		           who:      packet.sender,
			   hostmask: packet.hostmask,
			   network:  packet.network,
			   message:  tokens[1]
		       }); break;
    }

}


// { sender, hostmask, message, network }

cmd.runPublic = function (packet) {

    var tokens = tokenize(packet.message),
	name   = tokens[0];

    switch (name) {

	case 'greet': greet({
			  isPublic: true,
			  who:      packet.sender,
			  where:    packet.channel,
			  network:  packet.network
		      }); break;

	case 'quit':   quit({
		           who:      packet.sender,
			   hostmask: packet.hostmask,
			   network:  packet.network,
			   message:  tokens[1]
		       }); break;
    }
};


// { who, hostmask, network }

function quit(config) {


    var quitmsg = config.message || "";
    console.log(irc.outbound.quit(quitmsg));

    try {
	ensureOp(config.hostmask);
	console.log('Quitting by order of ' + config.who);
	config.network.send(irc.outbound.quit(quitmsg));
	process.exit();
    }
    catch (e) {
    console.log(e.message);
    }

}



// { isPublic, who, where, network }

function greet(config) {

    var message;
    
    if (config.isPublic) {
	message = config.who + ': Hello.';
	config.network.send(irc.outbound.say(config.where, message));
    } 
    else {
	message = 'Hello.';
	config.network.send(irc.outbound.say(config.who, message));
    }
}


// { who, hostmask, pwTry, network, operators }

function auth(config) {
    
    if (typeof config.operators[config.who] === 'undefined') {
	return;
    }
    
    if (config.operators[config.who] !== config.pwTry) {
	config.network.send(irc.outbound.say(config.who, 'Invalid password.'));
    }
    else {
	authdOps[config.hostmask] = true;
	config.network.send(irc.outbound.say(config.who, 'You are now authentified.'));
    }
}
