var SMTPServer = require('smtp-server').SMTPServer;

var server = new SMTPServer({
	size: 1024, // allow messages up to 1 kb 
	onData: handleMessage,
	disabledCommands: ['AUTH']
});

function handleMessage(stream, session, callback)
{
	var data = '';
	stream.on('data', function(chunk) {
		console.log("DATA");
		data += chunk;
	});

	stream.on('end', function() {
		console.log("END");

		// callback(null, 'Message queued as abcdef');
		setTimeout(function() {
			console.log("CALLBACK", callback);
			callback(null, 'Message queued as abcdef')
		}, 1000);

	});
}

server.listen(12225);