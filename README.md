# Mutalirc

My IRC bot for node.js. 


### Common Funcionalities

 * Command restrictedness;
 * Joining, parting, quitting, querying.


### Not-so-common Functionalities

 * Simple Google Books searching;
 * Simple RFC searching.


## Important Concepts

### Dispatchers

These are objects that determine the bot's behavior that depends on IRC messages. They are dynamically loaded and reloadable. Two examples of dispatchers are exported by [public.js] [public] and [query.js] [query]. Besides being advantageous in that resetting is not needed to update behavior, the dispatching mechanism is succint because command names are actually determined by the property names the dispatchers expose. For instance, if *foo* is a dispatcher and it has a property named 'sayhi', that property's value is invoked receiving as arguments the tokens responsible for its calling and the communication context with information it might need about the bot and its configuration. All dispatchers are property values of the object exported by [commands.js] [commands]. A dispatcher is called precisely like this:

<pre>
// Assuming 'cmd' is the object exported by commands.js,
// and that 'tokens' is an array of tokens parsed from an IRC
// messsage:

cmd[dispatcher][tokens[0]](tokens, packet);
</pre>

The structure above is purposefully verbose, if cluttered, so as to show the overall mechanism at work. The [actual implementation] [commands.js] uses more names to hide the ugly syntax.

[public]: https://github.com/guipn/mutalirc/blob/master/dispatchers/public.js

[query]: https://github.com/guipn/mutalirc/blob/master/dispatchers/query.js

[commands]: https://github.com/guipn/mutalirc/blob/master/commands.js
