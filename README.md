container-config-generator
==========================
A container configuration generator. Composable configurations for various container management systems and environments.

Using a one config to rule them all strategy, combines extensible configurations into common container output formats.

Features
--------
* Extensible configurations for different environments.
* Consistent environment file support.

name (container_name)
labels
image (build?)
k - replicas
k - imagePullPolicy
restartPolicy
command
resource limits
ports (named, expose only to linked pods - docker compose)
linking

env vars / env files
mapped volumes
remote volumes

//Later
dns?
dnsSearch?
extraHosts


Output Formats
--------------

### Docker-Compose

### Kuberentes

Config Format
-------------
```JSON
{
	"containerName": {
		"name" : "containerName",
		"labels": {
			"name": "containerName",
			"role": "myService",
			"foo": "bar"
		},


	}


}
```