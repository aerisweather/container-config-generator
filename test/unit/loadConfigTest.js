const assert = require('assert'),
	loadConfig = require('../../lib/loadConfig'),
	path = require('path');

describe("loadConfig", function() {
	it("should load a simple config", function(done) {
		loadConfig(path.join(__dirname, '..', 'fixtures', 'simple.json'), function(err, config) {
			assert.ifError(err);
			assert.equal(config.applicationName, "simple");
			assert.equal(config.instanceName, "v1");
			done();
		});
	});

	it("should merge an advanced config", function(done) {
		loadConfig(path.join(__dirname, '..', 'fixtures', 'advanced.json'), function(err, config) {
			assert.ifError(err);
			assert.equal(config.applicationName, "testing");
			assert.equal(config.instanceName, "v1");
			assert.equal(Object.keys(config.containers).length, 2);
			done();
		});
	});

	it("should error on bad path", function(done) {
		loadConfig(path.join(__dirname, '..', 'fixtures', 'doesnt-exist.json'), function(err, config) {
			assert.ok(err instanceof Error);
			done();
		});
	});

	it("should error on bad path we are extending from", function(done) {
		loadConfig(path.join(__dirname, '..', 'fixtures', 'advanced-broken.json'), function(err, config) {
			assert.ok(err instanceof Error);
			done();
		});
	});

});