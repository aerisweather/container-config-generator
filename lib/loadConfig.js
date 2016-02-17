const fs = require('fs'),
	path = require('path'),
	_ = require('lodash');


function loadConfig(configPath, callback) {
	fs.readFile(configPath, function (err, configContents) {
		if(err) {
			console.error("Couldn't load configuration file at: " + configPath);
			return callback(err);
		}

		try {
			var config = JSON.parse(configContents);
		}
		catch (err) {
			console.error("Config syntax error: ");
			console.error(err.message);
			return callback(err);
		}

		if (config['$extends']) {
			const configDir = path.dirname(configPath);
			const parentConfigPath = path.resolve(configDir, config['$extends']);
			loadConfig(parentConfigPath, function (err, parentConfig) {
				if(err) {
					console.error("Load requested via: " + configPath);
					return callback(err);
				}
				_.defaultsDeep(config, parentConfig);
				callback(null, config);
			});
		}
		else {
			// No nesting found
			return callback(null, config);
		}
	});
}

module.exports = loadConfig;