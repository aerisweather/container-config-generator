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
				"name":  "master",
				"image": "redis",
				"ports": {
					"redis": {
						"port": 6379
					}
				},
				"labels": {
					"hello": "world"
				}
			}
		}
	}
	beforeEach(function () {
		outputDir = path.join(os.tmpdir(), 'container-config');
		fs.removeSync(outputDir);
		fs.ensureDirSync(outputDir);
	});

	afterEach(function () {
		fs.removeSync(outputDir);
	});

	it("should render a namespace", function (done) {
		render(basicData, outputDir, function (err, result) {
			assert.ifError(err);
			var renderedNamespace = fs.readJsonSync(path.join(outputDir, 'namespace.json'));
			assert.equal(renderedNamespace.kind, "Namespace");
			assert.equal(renderedNamespace.metadata.name, "helloWorld");
			assert.equal(renderedNamespace.metadata.labels.name, "helloWorld");
			done();
		})
	});

	it("should render a single container", function (done) {
		render(singleContainer, outputDir, function (err, result) {
			assert.ifError(err);
			var renderedNamespace = fs.readJsonSync(path.join(outputDir, 'namespace.json'));
			assert.equal(renderedNamespace.kind, "Namespace");
			assert.equal(renderedNamespace.metadata.name, "helloWorld");
			assert.equal(renderedNamespace.metadata.labels.name, "helloWorld");
			done();
		})
	});
});