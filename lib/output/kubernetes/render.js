const async = require('async'),
	fs = require('fs-extra'),
	path = require('path'),
	_ = require('lodash');

const TEMPLATE_NAMESPACE_PATH = path.join(__dirname, 'namespace.json');
const TEMPLATE_RC_PATH = path.join(__dirname, 'replicationController.json');

function render(config, outputDir, callback) {
	// Render our config to our templates
	async.parallel({
			namespace:              function (cb) {
				return renderNamespace(config.applicationName, cb);
			},
			replicationControllers: function (cb) {
				return renderReplicationControllers(config, cb);
			}
		},
		function (err, renderedData) {
			if (err) {
				return callback(err);
			}
			//Use rendered results to write out files
			async.parallel({
					namespace: function (cb) {
						fs.writeJson(path.join(outputDir, 'namespace.json'), renderedData.namespace, cb)
					}
				},
				function (err, writeResults) {
					return callback(err, writeResults);
				})
		});
}

function renderNamespace(appName, callback) {
	fs.readJson(TEMPLATE_NAMESPACE_PATH, function (err, namespaceConfig) {
		if (err) {
			console.error("Namespace template has a syntax error: ", err.message);
			return callback(err);
		}
		namespaceConfig.metadata.name = appName;
		namespaceConfig.metadata.labels.name = appName;
		return callback(null, namespaceConfig);
	});
}

function renderReplicationControllers(config, callback) {
	fs.readJson(TEMPLATE_RC_PATH, function (err, rcDefaults) {
		if (config.containers && Object.keys(config.containers).length) {
			// Iterate over each of our containers
			_.forOwn(config.containers, function (containerDef, name) {

			});
		}
		return callback(null, {});
	});
}

function renderContainerRc(config, rcDefaults, containerDef) {
	var containerConfig = _.defaults({}, rcDefaults);

	var rcName = name + '-' + config.instanceName;
	containerConfig.metadata.name = name + '-' + config.instanceName;

	// Render Labels
	if (!containerDef.labels) {
		containerDef.labels = {};
	}
	containerConfig.metadata.labels = _.defaults({name: rcName}, containerDef.labels);

	const selector = {name: name, instance: config.instanceName};
	containerConfig.spec.template.metadata.labels = _.defaults(selector, containerDef.labels);
	containerConfig.spec.selector = selector;

	containerConfig.spec.replicas = containerDef.replicas;

	// Container setup
	var primaryContainer = containerConfig.spec.template.spec.containers[0];
	primaryContainer.name = name;
	primaryContainer.image = containerDef.image;

	// Render ports
	if (containerDef.ports) {
		primaryContainer.ports = [];
		_.forOwn(containerDef.ports, function (portDetails, name) {
			portDetails.name = name;
			primaryContainer.ports.push(portDetails);
		});
	}
	console.log("stahp");
}

module.exports = render;