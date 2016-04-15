# loopback-component-winston

Creates winston logger based on configuration in component-config.json file.
Here is a small example to illustrate:

```
{
	...
	"loopback-component-winston": {
		"level": "verbose",
		"transports": [
			{
				"type": "Console",
				"json": true
			}, {
				"type": "File",
				"name": "info-file",
				"filename": "error.log",
				"level": "info"
			}, {
				"type": "File",
				"name": "error-file",
				"filename": "error.log",
				"level": "error"
			}
		]
	}
	...
}
```

The configuration above creates an instance of _winston.Logger_ and binds it to a globally accessible _app.log_ property.
The _type_ property of transport descriptors denotes the name of the class in _winston.transports_ scope.

## requestLogger Middleware

The component comes with a request logging middleware. Bellow is an example of how it can be connected.

```
# middleware.json
{
	...
	"routes": {
		"loopback-component-winston#requestLogger": {
			"params": {
				"level": "info",
				"msg": "${res.statusCode} ${req.method} ${res.time}ms ${req.decodedUrl}",
				"meta": false
			}
		},
		...
	}
	...
}
```

Available options:
* _level_ [String] log level to report request
* _msg_ [String] message template
* _meta_ [Boolean] whether or not to include request/response meta information such as headers, body, query...
