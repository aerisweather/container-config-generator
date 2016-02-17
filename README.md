container-config-generator
==========================
A container configuration generator. Composable configurations for various container management systems and environments.

Using a one config to rule them all strategy, combines extensible configurations into common container output formats. This tool is intended for more advanced use cases with multi-container applications to alleviate hassles with multiple configs in development, staging, and production environments.

Features
--------
* Extensible configurations for different environments.
* Consistent environment variable/file support.

| Config Key | Description | Docker Compose Context | Kubernetes Context |
| ---------- | ----------- | ---------------------- | ------------------ |
| `$extends` | The parent json file to extend from (relative to the extender) | Will override config from parent | Will override config from parent | 
| `applicationName` | The name for the deploying application | n/a | The Kubernetes context these containers will be deployed to |
| `instanceName` | Name of this particular deployment of this app, a version number | The prefix for all the containers | A suffix for all the Replication Controllers. Best practice for repeatable deployments and rolling updates |
| `options` | Options for the renderer | Uses `docker-compose` child key for options | Uses `kubernetes` child key for options |
| `containers` | An object of container objects, see below | | |

#### Containers

| Config Key | Description | Docker Compose Context | Kubernetes Context | 
| ---------- | ----------- | ---------------------- | ------------------ |
| `name` | The name of the container | Part of `container_name` | Part of the name of the Service |
| `labels` | A key/value hash | The values of `labels` | The labels used to identify the Resource Controller |
| `image` | The container image to use | The container image to use | The container image to use |
| `ports` | A list of ports to expose | | |


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

### Docker-Compose (v1.2, Config version 2)

### Kuberentes (v1.x)

Config Format
-------------
```JSON
{
	"$extends": "../main.json",
	"application": "myApp",
	"instanceName": "v123",
	"containers":
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
}
```