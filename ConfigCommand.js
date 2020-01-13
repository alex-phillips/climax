
const chalk = require('chalk');
const Command = require('./Command');
const Logger = require('./Logger');
const Utils = require('./Utils');

class ConfigCommand extends Command {
  async run(args, options) {
    const option = args[0];
    const value = args[1];
    const data = this.config.flatten();

    if (!option) {
      const keys = Object.keys(data);
      const maxSize = keys.sort((a, b) => b.length - a.length)[0].length;

      for (const key in data) {
        Logger.info(`${Utils.pad(key, maxSize)} = ${chalk.cyan(data[key])}`);
      }

      return this.config.save();
    } if (data[option] === undefined) {
      throw Error(`Option '${option}' not found`);
    }

    if (!value) {
      if (options.reset) {
        this.config.reset(option);
        Logger.info(`Reset ${chalk.cyan(option)}`);
      } else {
        Logger.info(data[option]);
      }
    } else {
      this.config.set(option, value);
      Logger.info(`${chalk.cyan(option)} saved`);
    }

    this.config.save();
  }
}

module.exports = ConfigCommand;
