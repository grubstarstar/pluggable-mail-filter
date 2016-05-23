var PluginCreator = require('./plugin-factory');

var AntiSpamClient = PluginCreator.createSubClass({

	name: 'anti-spam',

	prepareRequest: function(messageInfo) {
		console.log("messageInfo: ", messageInfo)
	    return { data: messageInfo['data'] };
	},

	dependentOn: ['savi', 'sa']
});

module.exports = AntiSpamClient;