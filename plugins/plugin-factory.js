const http = require('http');

function PluginClient(args) {
	for(var arg in args) {
		this[arg] = args[arg];
	}
}

// Define attributes on the parent prototype which will be overridden by
// the objects that are created by the factory.
PluginClient.prototype.name = undefined;
PluginClient.prototype.host = 'localhost';
PluginClient.prototype.port = undefined;
PluginClient.prototype.dependentOn = [];

PluginClient.prototype.go = function(uid, messageInfo, callback) {

	var thisRule = this;

	if(typeof this.name == 'undefined') { console.error('this.name is not defined') } 
	if(typeof this.host == 'undefined') { console.error('this.host is not defined') } 
	if(typeof this.port == 'undefined') { console.error('this.port is not defined') } 
	
	preparedRequest = this.prepareRequest(messageInfo);

	var result = '';

	var postData = JSON.stringify(preparedRequest);

	var options = {
	  hostname: thisRule.host,
	  port: thisRule.port,
	  path: '/',
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/json',
	    'Content-Length': postData.length
	  }
	};

	console.log('Client %s connecting to %s:%d', thisRule.name, thisRule.host, thisRule.port);

	var req = http.request(options, (res) => {
		// console.log(`STATUS: ${res.statusCode}`);
		// console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			result += chunk;
			// console.log(`BODY: ${chunk}`);
		});
		res.on('end', () => {
			// console.log('No more data in response.')
			callback(thisRule, uid, JSON.parse(result));
		});

	});

	// write data to request body
	req.write(postData);
	req.end();

};

PluginClient.prototype.prepareRequest = function(messageInfo) {
    return messageInfo;
}

PluginClient.prototype.prepareResult = function(response) {
    return response;
}

module.exports = {

	createSubClass: function(object) {

		// defined the SubClass
		var SubClass = function(args) {
		    // call the Parent constructor
		    PluginClient.call(this, args);
		    console.log("Creating plugin '%s'. Connects to '%s:%d'", this.name, this.host, this.port);
		}

		// inherit from the Parent prototype
		SubClass.prototype = Object.create(PluginClient.prototype);
		SubClass.prototype.constructor = SubClass;

		// merge in the new attributes
		for (var attr in object) {
			SubClass.prototype[attr] = object[attr];
		}

		return SubClass;
	}		
}