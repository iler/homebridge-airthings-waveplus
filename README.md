# homebridge-airthings-wave-plus
With this [Homebridge](https://github.com/nfarina/homebridge) plugin you can use [Airthings WavePlus](https://www.airthings.com/wave-plus) with [Apple HomeKit](https://www.apple.com/ios/home/).

This code is heavily based on the work of iler's [homebridge-airthings-waveplus](https://github.com/iler/homebridge-airthings-waveplus) accessory, and the work of [pakastin](https://github.com/pakastin/homebridge-ruuvitag)!

This code is a work in progress.  There is currently a known issue around a bluetooth Stack Overflow in @abandonware/noble.

# Configuration

Example accessory config (needs to be added to the homebridge config.json):
 ...

		"accessories": [
      {
				"name": "Living Room WavePlus",
				"serialNumber": "1234567890",
				"disableTemp": false,
				"disableHumidity": false,
				"frequency": 60,
				"accessory": "Airthings WavePlus"
			}
    ]
 ...

### Config Explanation:

Field           			| Description
----------------------------|------------
**accessory**   			| (required) Must always be "Airthings WavePlus".
**name**							| (required) The name you want to use for for the WavePlus in HomeKit.
**serialNumber**			| (required) This shows up in the homekit accessory Characteristics and is used to index the control.
**disableTemp**  			| (optional) Display a Temperature widget? Boolean value defaults to False if not present.
**disableHumidity**		| (optional) Display a Humidity widget? Boolean value defaults to False if not present
**frequency**					| (optional) Frequency in seconds to update readings in HomeKit.

