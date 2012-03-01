var irc = exports;


// Some of the regex below must be mapped as 
// functions. To keep the API consistent, 
// all will be provided as such.

irc.inbound = {

    ping:      function () {
	           return "^PING :(.+)";
	       },

    version:   function (nick) {
                   return "^:(\\S+)!(\\S+@\\S+)\\sPRIVMSG\\s" + 
			  nick                                + 
			  ":.?VERSION.?";
	       },

    privmsg:   function (nick) {
	           return "^:(\\S+)!(\\S+@\\S+)\\sPRIVMSG\\s" +
			  nick                                + 
			  "\\s:(.+)";
	       },

    publicmsg: function () {
	           return "^:(\\S+)!(\\S+@\\S+)\\sPRIVMSG" +
			  "\\s([#&][a-zA-Z_0-9]+)\\s:(.+)";
	       }
};


irc.outbound = {

    nick:    function (nick) {
		 return 'NICK ' + nick + '\r\n';
	     },

    profile: function (nick, owner) {
		 return 'USER '      + nick  + ' ' + nick + 
			' unknown :' + owner + '\r\n';
	     },

    join:    function (channel) {
		 return 'JOIN ' + channel + '\r\n';
	     },

    say:     function (destination, message) {
	         return 'PRIVMSG ' + destination + ' :' + message + '\r\n';
	     },
    
    ping:    function (data) {
	         return 'PONG :' + data + '\r\n';
	     },

    version: function (requester, version) {
		 return 'NOTICE ' + requester + ' :VERSION ' +
			version   + '\r\n';
	     }

};
