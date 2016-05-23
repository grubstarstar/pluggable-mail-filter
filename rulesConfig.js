module.exports = [
	{
		clientPath: './plugins/savi-client.js',
		args: {
			host: 'localhost',
			port: 11111
		}
	},
	{
		clientPath: './plugins/sa-client.js',
		args: {
			host: 'localhost',
			port: 11112
		}
	},
	{
		clientPath: './plugins/antiSpam-client.js',
		args: {
			host: 'localhost',
			port: 11113
		}
	}
];