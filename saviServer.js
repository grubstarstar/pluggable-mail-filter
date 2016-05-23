var http = require('http');

var server = http.createServer(function(request, response) {

	var requestJson = "";
	request.on('data', (chunk) => {
		requestJson += chunk;
	});

	request.on('end', () => {
		console.log(requestJson);

		var queryData = JSON.parse(requestJson);


		// do the calulations here
		var result = {
			hasVirus: true,
			virusType: 'cryptolocker'
		};


		response.end(JSON.stringify(result));
	});

});

server.listen(11111, 'localhost');