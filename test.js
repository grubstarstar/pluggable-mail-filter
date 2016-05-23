var SMTPServer = require('smtp-server').SMTPServer;
var rulesConfig = require('./rulesConfig.js');
var crypto = require('crypto');
var os = require('os');
var util = require('util');

var rules = [];
rulesConfig.forEach(function(ruleConfig) {
	var ClientPlugin = require(ruleConfig.clientPath);
	var obj = new ClientPlugin(ruleConfig.args);
	rules.push(obj);
	console.log('obj: ', obj);
	console.log('obj.__proto__: ', obj.__proto__);
	console.log('obj.__proto__.__proto__: ', obj.__proto__.__proto__);
});
