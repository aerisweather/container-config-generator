//Take a config, merge accordingly
//Output in specified format
const Cli = require('admiral-cli'),
	path = require('path');

const cli = new Cli();
cli
	.option({
		name: 'configPath',
		description: 'The path to the configuration file. Container configuration will be generated based on this.',
		shortFlag: '-c',
		longFlag: '--config',
		type: 'string',
		length: 1,
		required: true
	})
	.option({
		name: 'outputPath',
		description: 'The output path of the rendered templates.',
		shortFlag: '-o',
		longFlag: '--output',
		type: 'string',
		length: 1,
		required: true,
		default: path.join(__dirname, 'output')
	});