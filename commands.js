var irc         = require('./irc.js'),
    cmd         = exports,
    authdOps    = {};

cmd.prefix = /^\./;
cmd.pub    = {};
cmd.priv   = {};



function ensureOp(hostmask) {
    if (typeof authdOps[hostmask] === 'undefined') {
    	// throwing is horrible. Need to make this better.
	throw { message: hostmask + ' is not authentified as an operator.' };
    }
}

function tokenize(msg) {
    return msg.slice(1).split(/\s/);
}


cmd.dispatch = function (packet, dispatcher) {
    
    var tokens = tokenize(packet.message),
	name   = tokens[0];

    if (typeof dispatcher[name] !== 'undefined') {
	dispatcher[name](tokens, packet);
    }

};


cmd.pub.quit = cmd.priv.quit = function (tokens, packet) {

    var quitmsg = tokens[1] || "";

    try {
	ensureOp(packet.hostmask);
	console.log('Quitting by order of ' + packet.sender);
	packet.network.send(irc.outbound.quit(quitmsg));
	process.exit();
    }
    catch (e) {
	console.log(e.message);
    }

};


cmd.priv.auth = function (tokens, packet) {
    
    if (typeof packet.options.operators[packet.sender] === 'undefined') {
	return;
    }
    
    if (packet.options.operators[packet.sender] !== tokens[1]) {
	config.network.send(irc.outbound.say(packet.sender, 'Invalid password.'));
    }
    else {
	authdOps[packet.hostmask] = true;
	packet.network.send(irc.outbound.say(packet.sender, 'You are now authentified.'));
    }
};
