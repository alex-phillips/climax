const winston = require('winston');
const { format } = require('winston');

const { timestamp, printf } = format;
const moment = require('moment');
const logUpdate = require('log-update');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5,
};

let instance = null;
let consoleTransport = null;
let fileTransport = null;

class Logger {
  static getInstance(config = { verbosity: 'error' }) {
    if (instance === null) {
      if (config.cliTimestamp === true) {
        config.cliTimestamp = Logger.timestamp;
      }
      consoleTransport = new (winston.transports.Console)({
        level: config.verbosity,
        format: winston.format.combine(
          winston.format.colorize({ level: true }),
          winston.format.simple(),
          timestamp(),
          printf(({ level, message, timestamp }) => {
            let line = message;

            if (levels[consoleTransport.level] > 2) {
              line = `${level}: ${line}`;
            }

            if (config.cliTimestamp) {
              line = `${timestamp} ${line}`;
            }

            // return `${timestamp} ${level}: ${message}`;
            return line;
          }),
        ),
      });

      const transports = [
        consoleTransport,
      ];

      if (config.file) {
        fileTransport = new (winston.transports.File)({
          filename: config.file,
          level: config.logLevel,
          align: true,
          timestamp: Logger.timestamp,
          json: false,
          handleExceptions: true,
          colorize: false,
        });
        transports.push(fileTransport);
      }

      instance = winston.createLogger({
        transports,
      });
    }

    return instance;
  }

  static flushAndExit(code) {
    return process.exit(code);
    // if (!Logger.getInstance().transports.file) {
    //   return process.exit(code);
    // }
    //
    // return Logger.getInstance().transports.file.on('flush', () => {
    //   process.exit(code);
    // });
  }

  static getLogLevel() {
    return Logger.getInstance().transports.file.level;
  }

  static getOutputLevel() {
    return consoleTransport.level;
  }

  static info(message, data = null, callback = null) {
    logUpdate.clear();
    Logger.getInstance().info(message, data, callback);
    logUpdate.done();
  }

  static error(message, data = null, callback = null) {
    logUpdate.clear();
    Logger.getInstance().error(message, data, callback);
    logUpdate.done();
  }

  static warn(message, data = null, callback = null) {
    logUpdate.clear();
    Logger.getInstance().warn(message, data, callback);
    logUpdate.done();
  }

  static verbose(message, data = null, callback = null) {
    logUpdate.clear();
    Logger.getInstance().verbose(message, data, callback);
    logUpdate.done();
  }

  static debug(message, data = null, callback = null) {
    logUpdate.clear();
    Logger.getInstance().debug(message, data, callback);
    logUpdate.done();
  }

  static silly(message, data = null, callback = null) {
    logUpdate.clear();
    Logger.getInstance().silly(message, data, callback);
    logUpdate.done();
  }

  static setConsoleLevel(level) {
    if (consoleTransport) {
      consoleTransport.level = level;
    }
  }

  static setFileLevel(level) {
    if (Logger.getInstance().transports.file) {
      Logger.getInstance().transports.file.level = level;
    }
  }

  static timestamp() {
    return moment().format('YYYY-MM-DD HH:mm:ss');
  }
}

module.exports = Logger;
