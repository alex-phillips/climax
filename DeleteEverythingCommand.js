'use strict';

let Command = require('./Command'),
  Logger = require('./Logger'),
  async = require('async'),
  fs = require('fs-extra'),
  inquirer = require('inquirer');

class DeleteEverythingCommand extends Command {
  async run(args, options) {
    let answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'really delete everything? ',
        default: false,
      }
    ]);

    if (!answers.confirm) {
      return;
    }

    Logger.verbose(`Removing cache directory ${Command.getCacheDirectory()}`);
    fs.removeSync(Command.getCacheDirectory());

    Logger.verbose(`Removing config directory ${Command.getConfigDirectory()}`);
    fs.removeSync(Command.getConfigDirectory());

    Logger.verbose(`Removing log directory ${Command.getLogDirectory()}`);
    fs.removeSync(Command.getLogDirectory());
  }
}

module.exports = DeleteEverythingCommand;
