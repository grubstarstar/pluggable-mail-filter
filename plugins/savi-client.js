var PluginCreator = require('./plugin-factory');

var SaviClient = PluginCreator.createSubClass({

	name: 'savi',

	prepareRequest: function(messageInfo) {
		console.log("messageInfo: ", messageInfo)
	    return { data: messageInfo['data'] };
	}

});

module.exports = SaviClient;