const assert = require('assert'),
	fs = require('fs-extra'),
	os = require('os'),
	path = require('path'),
	render = require('../../../../lib/output/kubernetes/render');

describe("Render - Kuberentes", function () {

	var outputDir;
	var basicData = {
		applicationName: "helloWorld"
	};
	var singleContainer = {
		"applicationName": "guestbook",
		"instanceName":    "v1",
		"containers":      {
			"redis-master": {
				"name":   "master",
				"image":  "redis",
				"ports":  {
					"redis": {
						"port": 6379
					}
				},
				"labels": {
					"hello": "world"
				}
			}
		}
	};
	beforeEach(function () {
		outputDir = path.join(os.tmpdir(), 'container-config');
		fs.removeSync(outputDir);
		fs.ensureDirSync(outputDir);
	});

	afterEach(function () {
		fs.removeSync(outputDir);
	});

	it("should render a namespace", function () {
		return render(basicData, outputDir)
			.then(() => {
				var renderedNamespace = fs.readJsonSync(path.join(outputDir, 'namespace.json'));
				assert.equal(renderedNamespace.kind, "Namespace");
				assert.equal(renderedNamespace.metadata.name, "helloWorld");
				assert.equal(renderedNamespace.metadata.labels.name, "helloWorld");
			});
	});

	it("should render a single container", function () {
		return render(singleContainer, outputDir)
			.then(() => {
				var renderedNamespace = fs.readJsonSync(path.join(outputDir, 'namespace.json'));
				assert.equal(renderedNamespace.kind, "Namespace");
				assert.equal(renderedNamespace.metadata.name, "guestbook");
				assert.equal(renderedNamespace.metadata.labels.name, "guestbook");

				var renderedRc = fs.readJsonSync(path.join(outputDir, 'ReplicationControllers', 'redis-master.json'));
				assert.equal(renderedRc.kind, "ReplicationController");
				assert.equal(renderedRc.metadata.labels.name, "redis-master-v1");
				assert.equal(renderedRc.spec.template.spec.containers[0].name, "redis-master");
				assert.equal(renderedRc.spec.template.spec.containers[0].image, "redis");

				var renderedSvc = fs.readJsonSync(path.join(outputDir, 'Services', 'redis-master.json'));
				assert.equal(renderedSvc.kind, "Service");
				assert.equal(renderedSvc.metadata.labels.name, "redis-master");
				assert.equal(renderedSvc.spec.selector.name, "redis-master");
			})
	});

	it("should render a full application", function() {
		const config = fs.readJsonSync(path.join(__dirname, '..', '..', '..', 'fixtures', 'guestbook', 'config.json'));


	});
});