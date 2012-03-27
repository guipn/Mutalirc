var irc      = require('./irc.js'),
    cmd      = exports,
    authd    = {}; // People authentified

cmd.prefix = /^\./;


function tokenize(msg) {

    return msg.slice(1).split(/\s/);

}


cmd.load = function (dispatcher, context) {

    var dispatcherFile = context.options.dispatcherDir + 
			 '/' + dispatcher + '.js',
	absolutePath = require.resolve(dispatcherFile);

    delete require.cache[absolutePath];
    
    cmd[dispatcher] = require(dispatcherFile);

}


cmd.unload = function (dispatcher) {

    return delete cmd[dispatcher];

};


cmd.dispatch = function (context) {

    var tokens     = tokenize(context.message),
	name       = tokens[0],
	dispatcher = context.dispatcher,
	commandFun;

    context.authd = authd;
    context.cmd   = cmd;
 
    if (typeof cmd[dispatcher] === 'undefined') {
	cmd.load(dispatcher, context);
    }

    commandFun = cmd[dispatcher][name];
   
    if (typeof commandFun === 'undefined') {
	return;
    }

    if (commandFun.restricted === false) {
	commandFun(tokens, context);
    } 
    else if (typeof authd[context.hostmask] !== 'undefined') {
	commandFun(tokens, context);
    }

};
