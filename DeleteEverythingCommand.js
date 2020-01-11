const fs = require('fs');
const inquirer = require('inquirer');
const Logger = require('./Logger');
const Command = require('./Command');

class DeleteEverythingCommand extends Command {
  async run(args, options) {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'really delete everything? ',
        default: false,
      },
    ]);

    if (!answers.confirm) {
      return;
    }

    Logger.verbose(`Removing cache directory ${Command.getCacheDirectory()}`);
    fs.rmdirSync(Command.getCacheDirectory(), { recursive: true });

    Logger.verbose(`Removing config directory ${Command.getConfigDirectory()}`);
    fs.rmdirSync(Command.getConfigDirectory(), { recursive: true });

    Logger.verbose(`Removing log directory ${Command.getLogDirectory()}`);
    fs.rmdirSync(Command.getLogDirectory(), { recursive: true });
  }
}

module.exports = DeleteEverythingCommand;
