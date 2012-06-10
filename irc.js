var interp = require('./util.js').interp,
    irc    = exports;


irc.process = function (text, config) {

    console.log(text);

    var ircCommands = Object.getOwnPropertyNames(irc.inbound),
	result = {};
    
    ircCommands.forEach(function (ircCommand) {

	var re   = irc.inbound[ircCommand](config.nick),
	    test = text.match(re);

	if (test === null) {
	    return;
	}

	switch (ircCommand) {

	    case 'ping':
		result = {
		    content: test[1]
		}; break;

	    case 'version':
		result = {
		    requester: test[1]	
		}; break;

	    case 'privmsg':
		result = {
		    sender:   test[1],
		    hostmask: test[2],
		    message:  test[3]
		}; break;

	    case 'publicmsg':
		result = {
		    sender:   test[1],
		    hostmask: test[2],
		    channel:  test[3],
		    message:  test[4]
		}; break;

	}

	result.ircCmd = ircCommand;
    });

    return result;
};


irc.inbound = {

    ping:      function () {
	           return "^PING :(.+)";
	       },

    version:   function (nick) {
		   return interp('^:(\\S+)!(\\S+@\\S+)\\sPRIVMSG\\s{nck}' +
			         '\\s:.?VERSION.?',
				 { nck: nick });
	       },

    privmsg:   function (nick) {
		   return interp('^:(\\S+)!(\\S+@\\S+)\\sPRIVMSG\\s{nck}\\s:(.+)',
				 { nck: nick });
	       },

    publicmsg: function () {
	           return "^:(\\S+)!(\\S+@\\S+)\\sPRIVMSG" +
			  "\\s([#&][a-zA-Z_0-9]+)\\s:(.+)";
	       }

};


irc.outbound = {

    pass:    function (password) {
		 return interp('PASS {pass}\r\n', { pass: password });
	     },

    nick:    function (nick) {
		 return interp('NICK {nck}\r\n', { nck: nick });
	     },

    user:    function (nick, owner) {
		 return interp('USER {nck} {nck} unknown :{own}\r\n',
				{
				    nck: nick,
				    own: owner
				});
	     },

    join:    function (channel, pass) {
		 return interp('JOIN {ch} {key}\r\n', 
				{ 
				    ch: channel,
				    key: pass ? pass : ''
				});
	     },

    part:    function (channel) {
		 return interp('PART {ch}\r\n', { ch: channel });
	     },

    say:     function (destination, message) {
		 return interp('PRIVMSG {dst} :{msg}\r\n', 
			       {
				   dst: destination,
				   msg: message
			       });
	     },
    
    pong:    function (data) {
	         return interp('PONG :{dt}\r\n', { dt: data });
	     },

    version: function (requester, version) {
		 return interp('NOTICE {req} :VERSION {ver}\r\n',
			       {
				   req: requester,
				   ver: version
			       });
	     },

    quit:    function (msg) {
		 return interp('QUIT :{msg}\r\n', { msg: msg });
	     }

};

