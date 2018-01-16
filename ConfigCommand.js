'use strict';

var Command = require('./Command'),
  Logger = require('./Logger'),
  Utils = require('./Utils'),
  chalk = require('chalk');

class ConfigCommand extends Command {
  async run(args, options) {
    let option = args[0],
      value = args[1],
      data = this.config.flatten();

    if (!option) {
      let keys = Object.keys(data);
      let maxSize = keys.sort((a, b) => {
        return b.length - a.length;
      })[0].length;

      for (let key in data) {
        Logger.info(`${Utils.pad(key, maxSize)} = ${chalk.cyan(data[key])}`);
      }

      return this.config.save();
    } else if (data[option] === undefined) {
      throw Error(`Option '${option}' not found`);
    }

    if (!value) {
      if (options.reset) {
        this.config.reset(option);
        Logger.info(`Reset ${option.cyan}`);
      } else {
        Logger.info(data[option]);
      }
    } else {
      this.config.set(option, value);
      Logger.info(`${option.cyan} saved`);
    }

    this.config.save();
  }
}

module.exports = ConfigCommand;
