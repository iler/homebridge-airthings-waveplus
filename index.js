const waveplus = require('node-airthings-waveplus');

let Service;
let Characteristic;

const waitingDevices = {};
const devices = {};

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('airthings-waveplus', 'Aithings Waveplus', AirthingsWaveplus, true);
};

class AirthingsWaveplus {
  constructor (log, config) {
    this.log = log;
    this.name = config.name;
    this.serialNumber = config.serialNumber;
    this.config = config;
    this.updatedAt = 0;

    WavePlus.on('found', wavePlus => {
      devices[wavePlus.id] = wavePlus;
      waitingDevices[wavePlus.id] && waitingDevices[wavePlus.id](wavePlus);
      delete waitingDevices[wavePlus.id];
      debug('found', wavePlus.id);
    });

    if (!config.disableTemp) {
      this.tempService = new Service.TemperatureSensor(this.name);
      this.tempService
        .getCharacteristic(Characteristic.CurrentTemperature)
        .setProps({ minValue: -200, maxValue: 200, minStep: 0.01 });
    }
    if (!config.disableHumidity) {
      this.humidityService = new Service.HumiditySensor(this.name);
      this.humidityService
        .getCharacteristic(Characteristic.CurrentRelativeHumidity)
        .setProps({ minValue: 0, maxValue: 100, minStep: 0.5 });
    }

    var wavePlus;
    var listenTo;
    listenTo = (wavePlus) => {
      wavePlus.on('updated', (data) => {
        this.update(wavePlus, data);
      });
    }

    if (wavePlus) {
      listenTo(wavePlus);
    } else {
      waitingDevices[this.id] = (wavePlus) => {
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

    debug(data);
  }

  getServices () {
    const services = [];

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
