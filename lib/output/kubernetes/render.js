const co = require('co'),
	fs = require('fs-extra'),
	path = require('path'),
	_ = require('lodash');

const TEMPLATE_NAMESPACE_PATH = path.join(__dirname, 'namespace.json');
const TEMPLATE_RC_PATH = path.join(__dirname, 'replicationController.json');
const TEMPLATE_SERVICE_PATH = path.join(__dirname, 'service.json');
/**
 *
 * @param config
 * @param outputDir
 * @returns {Promise}
 */
function render(config, outputDir) {
	return co(function*() {

		// @todo validate - more labels to key off of than just name. Services need to point to something that can move around

		// Render our config to our templates
		const namespaceOutput = path.join(outputDir, 'namespace.json');
		yield renderNamespace(config.applicationName, namespaceOutput);

		const serviceOutputPath = path.join(outputDir, 'Services');
		yield renderServices(config, serviceOutputPath);

		const rcOutputPath = path.join(outputDir, 'ReplicationControllers');
		yield renderReplicationControllers(config, rcOutputPath);

		return [namespaceOutput, rcOutputPath];
	});
}

/**
 * Render a Namespace config to a file.
 *
 * @param {string} appName - Name of our app (our namespace) in this context
 * @param {string} outputFilePath - The path where the output config should go.
 * @returns {Promise}
 */
function renderNamespace(appName, outputFilePath) {
	return co(function*() {
		try {
			var namespaceConfig = yield (cb) => fs.readJson(TEMPLATE_NAMESPACE_PATH, cb);
		} catch (err) {
			console.error("Namespace template has a syntax error: ", err.message);
			throw err;
		}

		namespaceConfig.metadata.name = appName;
		namespaceConfig.metadata.labels.name = appName;

		return yield (cb) => fs.writeJson(outputFilePath, namespaceConfig, cb);
	});
}

/**
 *
 * @param config
 * @param outputPath
 * @returns {Promise}
 */
function renderReplicationControllers(config, outputPath) {
	return co(function* () {

		yield (cb) => fs.ensureDir(outputPath, cb);
		var rcDefaults = yield (cb) => fs.readJson(TEMPLATE_RC_PATH, cb);

		if (config.containers && Object.keys(config.containers).length) {
			// Iterate over each of our containers
			var containerConfigWrites = {};
			_.forOwn(config.containers, function (containerDef, name) {
				var containerConfig = applyRcConfig(config, rcDefaults, name, containerDef);
				var outputFilePath = path.join(outputPath, name + '.json');
				containerConfigWrites[name] = (cb) => fs.writeJson(outputFilePath, containerConfig, cb);
			});
			return yield containerConfigWrites;
		}
		return {};
	});
}

function applyRcConfig(config, rcDefaults, containerName, containerDef) {
	var rcConfig = _.defaults({}, rcDefaults);

	var rcName = containerName + '-' + config.instanceName;
	rcConfig.metadata.name = rcName;

	// Render Labels
	if (!containerDef.labels) {
		containerDef.labels = {};
	}
	rcConfig.metadata.labels = _.defaults({name: rcName}, containerDef.labels);

	const selector = {name: containerName, instance: config.instanceName};
	rcConfig.spec.template.metadata.labels = _.defaults({}, selector, containerDef.labels);
	rcConfig.spec.selector = selector;

	if (containerDef.replicas !== undefined) {
		rcConfig.spec.replicas = containerDef.replicas;
	}
	// Container setup
	var primaryContainer = rcConfig.spec.template.spec.containers[0];
	primaryContainer.name = containerName;
	primaryContainer.image = containerDef.image;

	// Render ports
	if (containerDef.ports) {
		primaryContainer.ports = [];
		_.forOwn(containerDef.ports, function (portDetails, name) {
			portDetails.name = name;
			primaryContainer.ports.push(portDetails);
		});
	}
	return rcConfig;
}

function renderServices(config, outputPath) {
	return co(function* () {

		yield (cb) => fs.ensureDir(outputPath, cb);
		var serviceDefaults = yield (cb) => fs.readJson(TEMPLATE_SERVICE_PATH, cb);

		if (config.containers && Object.keys(config.containers).length) {
			// Iterate over each of our containers
			var containerConfigWrites = {};
			_.forOwn(config.containers, function (containerDef, name) {
				var containerConfig = applyServiceConfig(config, serviceDefaults, name, containerDef);
				var outputFilePath = path.join(outputPath, name + '.json');
				containerConfigWrites[name] = (cb) => fs.writeJson(outputFilePath, containerConfig, cb);
			});
			return yield containerConfigWrites;
		}
		return {};
	});
}

function applyServiceConfig(config, serviceDefaults, containerName, containerDef) {
	var serviceConfig = _.defaults({}, serviceDefaults);

	//Set name
	serviceConfig.metadata.name = containerName;
	serviceConfig.metadata.labels = _.defaults({name: containerName}, containerDef.labels);
	serviceConfig.spec.selector.name = containerName;

	//Set Ports
	if (containerDef.ports) {
		serviceConfig.spec.ports = [];
		_.forOwn(containerDef.ports, function (portDetails, name) {
			portDetails.name = name;
			serviceConfig.spec.ports.push(portDetails);
		});
	}
	return serviceConfig;
}

module.exports = render;