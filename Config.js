const fs = require('fs');
const ini = require('ini');
const ParameterBag = require('./ParameterBag');

let defaultConfig = {};

class Config extends ParameterBag {
  constructor(filePath, baseConfig = {}) {
    defaultConfig = baseConfig;

    let config = {};
    try {
      fs.statSync(filePath);
      config = ini.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) { }

    config = new ParameterBag(config);

    Object.keys(defaultConfig).map(key => {
      let val = defaultConfig[key].default;
      const savedValue = config.get(key);
      if (savedValue !== null) {
        val = savedValue;
      }

      config[key] = val;
    });

    super(config);
    this.filePath = filePath;
  }

  reset(key) {
    if (defaultConfig[key] !== undefined) {
      this.set(key, defaultConfig[key].default);
    }
  }

  save() {
    fs.writeFileSync(this.filePath, ini.stringify(this.getData()));
  }

  set(key, value) {
    if (!defaultConfig[key]) {
      return;
    }

    switch (defaultConfig[key].type) {
      case 'bool':
        if (typeof value === 'boolean') {
          break;
        }

        if (value === true || value === 'true' || value === 1 || value === '1') {
          value = true;
          break;
        }
        value = false;
        break;
      case 'choice':
        if (defaultConfig[key].choices.indexOf(value) === -1) {
          throw Error(`Invalid value '${value}'. Must be one of the following: ${defaultConfig[key].choices.join(', ')}`);
        }
        break;
      default:
        break;
    }

    super.set(key, value);
  }
}

module.exports = Config;
