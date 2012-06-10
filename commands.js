var cmd   = exports,
    fs    = require('fs'),
    irc   = require('./irc.js'),
    authd = {}; // People authentified

cmd.prefix = '.';


function tokenize(msg) {

    var ret = msg.split(/\s/),
	fst = ret.shift();

    return (fst === cmd.prefix) ? ret : undefined;
    
}


cmd.load = function (dispatcher, context) {

    var dispatcherFile = context.options.dispatcherDir + 
			 '/' + dispatcher + '.js',
	absolutePath   = require.resolve(dispatcherFile);

    delete require.cache[absolutePath];
    cmd[dispatcher] = require(dispatcherFile);
}


cmd.unload = function (dispatcher) {

    return delete cmd[dispatcher];

};


cmd.dispatch = function (context) {

    var dispatcher = context.dispatcher,
	tokens     = tokenize(context.message),
	name,
	commandFun;

    if (tokens) {
	name = tokens[0];
    }
    
    context.authd = authd;
    context.cmd   = cmd;
 
    if (typeof cmd[dispatcher] === 'undefined') {
	cmd.load(dispatcher, context);
    }

    commandFun = cmd[dispatcher][name];
   
    if (typeof commandFun === 'undefined') {
	return;
    }

    if (commandFun.restricted === false ||
	typeof authd[context.hostmask] !== 'undefined') {
	commandFun(tokens, context);
    } 
};
