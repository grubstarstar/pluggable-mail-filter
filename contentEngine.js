var SMTPServer = require('smtp-server').SMTPServer;
var rulesConfig = require('./rulesConfig.js');
var crypto = require('crypto');
var os = require('os');
var util = require('util');

var rules = [];
rulesConfig.forEach(function(ruleConfig) {
	var ClientPlugin = require(ruleConfig.clientPath);
	rules.push(new ClientPlugin(ruleConfig.args));
});

state = {}; // E.g. {uid}{pluginResults}{savi} = { status: "virus", type: "cryptolocker" }
hasStarted = {}; // E.g {uid}{savi} = true;

var server = new SMTPServer({
	size: 1024 * 1024, // allow messages up to 1Mb
	onData: handleMessage,
	disabledCommands: ['AUTH']
});

function handlePluginResult(rule, uid, result) {

	// console.log("RESULT = ", result)

	// console.log("%s: handlePluginResult() - %s", uid, rule.name);

	state[uid].messageInfo.pluginResults[rule.name] = result;

	// console.log("STATE: ", state[uid].messageInfo.pluginResults);

	// run rules whose dependents are now satisfied
	for(var i in rules) {
		// skip if the rule has already been triggered for this message
		if(hasStarted[uid][rules[i].name]) {
			continue;
		}
		// if there are results for all the dependencies
		// then the rule is ready to fire
		var ruleIsReady = true;
		for(var j in rules[i].dependentOn) {	
			if(!state[uid].messageInfo.pluginResults[rules[i].dependentOn[j]]) {
				ruleIsReady = false;
			}
		}
		// fire the rule if all dependents have yielded results
		if(ruleIsReady) {
			hasStarted[uid][rules[i].name] = true;
			rules[i].go(uid, state[uid].messageInfo, handlePluginResult);
		}
	}

	var incomplete = false;
	for (var i = 0; i < rules.length; i++) {
		var result = state[uid].messageInfo.pluginResults[rules[i].name];
	 	if(!state[uid].messageInfo.pluginResults[rules[i].name]) {
	 		incomplete = true;
	 	}
	}

	if(!incomplete && state[uid])
	{
		console.log('Final state ===> ', state[uid].messageInfo.pluginResults)
		var responseCode = 250;
		for(var ruleName in state[uid].messageInfo.pluginResults) {
			if(state[uid].messageInfo.pluginResults[ruleName].action == 'DEFER') {
				responseCode = 450;
			}
		}
		if(responseCode == 250) {
			var endTime = process.hrtime(state[uid].startTime);
			console.log("Time taken for message: %s seconds, %s milliseconds", endTime[0], endTime[1] / 1000000)
			state[uid].smtpCallback(null, 'Message is clean');
			delete hasStarted[uid];
			delete state[uid];
		} else {
			err = new Error('Message is not clean');
			err.responseCode = responseCode;
			state[uid].smtpCallback(err);
			delete hasStarted[uid];
			delete state[uid];
		}
	}
}

function handleMessage(stream, session, callback)
{
	var startTime = process.hrtime();
	// create a unique id for the message so we can keep track of it
	var uid = crypto.randomBytes(16).toString('hex');

	console.log("%s: contentEngine.js: handleMessage()", uid);

	var data = '';
	stream.on('data', function(chunk) {
		data += chunk;
	});

	stream.on('end', function() {
		
		var err;
		if(stream.sizeExceeded)
		{
			err = new Error('Message exceeds fixed maximum message size');
			err.responseCode = 552;
			return callback(err);
		}

		state[uid] = {
			startTime: startTime,
			smtpCallback: callback,
			messageInfo: {
				pluginResults: {},
				data: data,
				session: session
			}
		};

		// start all rules that aren't dependent on any others' results
		for (var i = 0; i < rules.length; i++) {
			if(rules[i].dependentOn.length == 0) {
				// start this rule
				hasStarted[uid] = {};
				hasStarted[uid][rules[i].name] = true;
				rules[i].go(uid, state[uid].messageInfo, handlePluginResult);
			}
		}

	});
}

server.listen(12225, 'localhost', function() {console.log("Server listening...")});