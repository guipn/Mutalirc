var irc      = require('./irc.js'),
    cmd      = exports,
    authd    = {}; // People authentified

cmd.prefix = /^\./;


function tokenize(msg) {

    return msg.slice(1).split(/\s/);

}


cmd.load = function (dispatcher, packet) {

    var dispatcherFile = packet.options.dispatcherDir + 
			 '/' + dispatcher + '.js',
	absolutePath = require.resolve(dispatcherFile);

    delete require.cache[absolutePath];
    
    cmd[dispatcher] = require(dispatcherFile);

}


cmd.dispatch = function (dispatcher, packet) {

    var tokens = tokenize(packet.message),
	name   = tokens[0],
	commandFun;

    packet.authd = authd;
    packet.cmd   = cmd;
 
    if (typeof cmd[dispatcher] === 'undefined') {
	cmd.load(dispatcher, packet);
    }

    commandFun = cmd[dispatcher][name];
   
    if (typeof commandFun === 'undefined') {
	return;
    }

    if (commandFun.restricted === false) {
	commandFun(tokens, packet);
    } 
    else if (typeof authd[packet.hostmask] !== 'undefined') {
	commandFun(tokens, packet);
    }

};
