const WavePlus = require('node-airthings-waveplus');

let Service;
let Characteristic;

const waitingDevices = {};
const devices = {};

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-wave-plus', 'Airthings WavePlus', AirthingsWaveplus, true);
};

class AirthingsWaveplus {
  constructor (log, config) {
    this.log = log;
    this.config = config;
    this.name = this.config.name;
    this.serialNumber = this.config.serialNumber;
    this.updatedAt = 0;
    this.manufacturer="Airthings";
    this.model="Wave Plus";

    var wavePlus
    WavePlus.on('found', wavePlus => {
      devices[wavePlus.serialNumber] = wavePlus;
      log('found', wavePlus.id, 'serial number', wavePlus.serialNumber);
      log('address', wavePlus.address);
      log('connectable', wavePlus.connectable);      
      waitingDevices[wavePlus.serialNumber] && waitingDevices[wavePlus.serialNumber](wavePlus);
      delete waitingDevices[wavePlus.serialNumber];
    });

    if (!this.config.disableTemp) {
      this.tempService = new Service.TemperatureSensor(this.name);
      this.tempService
        .getCharacteristic(Characteristic.CurrentTemperature)
        .setProps({ minValue: -200, maxValue: 200, minStep: 0.01 });
    }
    if (!this.config.disableHumidity) {
      this.humidityService = new Service.HumiditySensor(this.name);
      this.humidityService
        .getCharacteristic(Characteristic.CurrentRelativeHumidity)
        .setProps({ minValue: 0, maxValue: 100, minStep: 0.5 });
    }

    var listenTo;
    listenTo = (wavePlus) => {
    	log('listening...');
      wavePlus.on('updated', (data) => {
      	log('Updated data:', data);
        this.update(wavePlus, data);
      });
    }

    if (wavePlus) {
      listenTo(wavePlus);
    } else {
      waitingDevices[this.serialNumber] = (wavePlus) => {
        listenTo(wavePlus);
      };
    }
  }

  update (wavePlus, data) {
    const { config } = this;
    const { temperature, humidity } = data;

    wavePlus.previousValues = data;

    const now = Date.now();

    if ((config.frequency == null) || ((now - this.updatedAt) > config.frequency * 1000)) {
      this.updatedAt = now;

      if (!config.disableTemp) {
        if (temperature !== this.temperature) {
          this.temperature = temperature;
          this.tempService
            .getCharacteristic(Characteristic.CurrentTemperature)
            .updateValue(temperature);
        }
      }

      if (!config.disableHumidity) {
        if (humidity !== this.humidity) {
          this.humidity = humidity;
          this.humidityService
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .updateValue(humidity);
        }
      }
    }

  }

  getServices () {
 		const informationService = new Service.AccessoryInformation()
			.setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
			.setCharacteristic(Characteristic.Model, this.model)
			.setCharacteristic(Characteristic.SerialNumber, this.serialNumber)

		const services = [informationService]

    if (this.tempService) {
      services.push(this.tempService);
    }

    if (this.humidityService) {
      services.push(this.humidityService);
    }
    
    return services;
  }
}

function hypotenuse (a, b, c = 0) {
  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2) + Math.pow(c, 2));
}
