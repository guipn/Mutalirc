var cmd   = exports,
    fs    = require('fs'),
    irc   = require('./irc.js'),
    log   = require('./log.js'),
    authd = {}; // People authentified

cmd.prefix = '.';


function tokenize(msg) {

    var ret = msg.split(/\s/),
	fst = ret.shift();

    return (fst === cmd.prefix) ? ret : undefined;
    
}


cmd.load = function (dispatcherName, context) {

    log.debug('Loading dispatcher ' + dispatcherName + '.');

    var dispatcherFile = context.options.dispatcherDir + 
			 '/' + dispatcherName + '.js',
	absolutePath   = require.resolve(dispatcherFile);

    delete require.cache[absolutePath];
    cmd[dispatcherName] = require(dispatcherFile);
}


cmd.unload = function (dispatcherName) {

    log.debug('Unloading dispatcher ' + dispatcherName + '.');
    return delete cmd[dispatcherName];

};


cmd.dispatch = function (context) {

    var dispatcher = context.dispatcher,
	tokens     = tokenize(context.message),
	name,
	commandFunc;

    if (tokens) {
	name = tokens[0];
    }
    
    context.authd = authd;
    context.cmd   = cmd;
 
    if (typeof cmd[dispatcher] === 'undefined') {
	cmd.load(dispatcher, context);
    }

    commandFunc = cmd[dispatcher][name];
   
    if (typeof commandFunc === 'undefined') {
	log.debug('Command "' + name + 
		  '" not found on dispatcher ' + dispatcherName);
	return;
    }

    if (commandFunc.restricted === false ||
	typeof authd[context.hostmask] !== 'undefined') {
	commandFunc(tokens, context);
    } 
};
