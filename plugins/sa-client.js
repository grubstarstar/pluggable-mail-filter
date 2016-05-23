var PluginCreator = require('./plugin-factory');

var SaviClient = PluginCreator.createSubClass({

	name: 'sa',

	prepareRequest: function(messageInfo) {
		console.log("messageInfo: ", messageInfo)
	    return { data: messageInfo['data'] };
	},

	dependentOn: ['savi']
});

module.exports = SaviClient;