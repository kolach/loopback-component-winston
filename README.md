# loopback-component-winston

Creates winston logger based on configuration in component-config.json file.
Here is a small example to illustrate:

```
{
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
}
```

The configuration above creates an instance of _winston.Logger_ and binds it to a globally accessible _app.log_ property.
The _type_ property of transport descriptors denotes the name of the class in _winston.transports_ scope.
