var interp = require('./util.js').interp,
    irc    = exports;


// Some of the regex below must be mapped as 
// functions. To keep the API consistent, 
// all will be provided as such.

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

    join:    function (channel) {
		 return interp('JOIN {ch}\r\n', { ch: channel });
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
    
    ping:    function (data) {
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
		 return interp('QUIT : {msg}\r\n', { msg: msg });
	     }

};
