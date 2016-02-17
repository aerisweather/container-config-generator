//Take a config, merge accordingly
//Output in specified format
const Cli = require('admiral-cli'),
	fs = require('fs-extra'),
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

try {
	cli.parse();
}
catch (error) {
	console.error(error);
	if (error instanceof Cli.CliInvalidInputError) {
		process.exit(2);
	}
	else if (error instanceof Cli.CliConfigError) {
		console.error('Doh, configured something wrong.', error);
		process.exit(1);
	}
}

// Load and parse config file

// Setup output directory
fs.ensureDirSync(cli.params.outputPath);

// Pass data to generator