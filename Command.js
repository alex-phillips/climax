const fs = require('fs');
const chalk = require('chalk');
const elegantSpinner = require('elegant-spinner');
const envPaths = require('env-paths');
const logUpdate = require('log-update');
const os = require('os');
const Logger = require('./Logger');

let paths = null;
let spinner = null;
let spinnerText = '';

class Command {
  constructor(config = {}) {
    if (Command.APP_NAME === null) {
      throw Error('No app name set');
    }

    if (config.constructor.name !== 'Config') {
      throw Error('Second parameter must be an instance of \'Config\'.');
    }

    this.config = config;
  }

  async execute() {
    try {
      Logger.debug(`Running ${this.constructor.name}`);
      await this.run(...arguments);
      Command.shutdown(0);
    } catch (err) {
      Logger.error(`Uncaught error: ${err}`);
      Command.shutdown(1);
    }
  }

  async run(cmd, options) { }

  static getAppName() {
    return Command.APP_NAME;
  }

  static getCacheDirectory() {
    if (Command.APP_NAME === null) {
      throw Error('No app name set');
    }

    try {
      fs.statSync(paths.cache);
    } catch (e) {
      fs.mkdirSync(paths.cache, { recursive: true });
    }

    return paths.cache;
  }

  static getConfigDirectory() {
    if (Command.APP_NAME === null) {
      throw Error('No app name set');
    }

    try {
      fs.statSync(paths.config);
    } catch (e) {
      fs.mkdirSync(paths.config, { recursive: true });
    }

    return paths.config;
  }

  static getHomeDirectory() {
    return os.homedir();
  }

  static getLogDirectory() {
    if (Command.APP_NAME === null) {
      throw Error('No app name set');
    }

    try {
      fs.statSync(paths.log);
    } catch (e) {
      fs.mkdirSync(paths.log, { recursive: true });
    }

    return paths.log;
  }

  static getTempDirectory() {
    if (Command.APP_NAME === null) {
      throw Error('No app name set');
    }

    try {
      fs.statSync(paths.temp);
    } catch (e) {
      fs.mkdirSync(paths.temp, { recursive: true });
    }

    return paths.temp;
  }

  static setAppName(name) {
    Command.APP_NAME = name;
    paths = envPaths(name);
  }

  static shutdown(code) {
    if (code === undefined) {
      code = 0;
    }

    Logger.debug(`Exiting with code ${code}`);

    process.exit(code);
  }

  static startSpinner(message, verbosity) {
    if (Logger.getOutputLevel() !== 'info') {
      return;
    }

    spinnerText = message || '';

    const frame = elegantSpinner();
    logUpdate.done();
    spinner = setInterval(() => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(spinnerText + chalk.bold.cyan(frame()));
    }, 50);
  }

  static updateSpinner(message) {
    spinnerText = message || '';
  }

  static stopSpinner(message) {
    if (spinner) {
      clearInterval(spinner);
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      if (message) {
        console.log(message);
      }
    }
  }
}

Command.APP_NAME = null;
Command.VERBOSE_LEVEL = 0;

module.exports = Command;
