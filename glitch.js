'use strict';

let chalk = require('chalk'),
yargs = require('yargs'),
Command = require('./Command'),
Config = require('./Config'),
Logger = require('./Logger'),
defaultCommands = {
  'config': {
    usage: '[flags] [key] [value]',
    desc: 'Read, write, and reset config values',
    options: {
      r: {
        group: 'Flags:',
        alias: 'reset',
        demand: false,
        desc: 'Reset the config option to its default value',
        type: 'boolean'
      }
    },
    file: './ConfigCommand'
  },
},
defaultConfig = {
  'cli.colors': {
    type: 'bool',
    default: true,
  },
  'cli.progressBars': {
    type: 'bool',
    default: true,
  },
  'cli.progressInterval': {
    type: 'string',
    default: 250,
  },
  'cli.timestamp': {
    type: 'bool',
    default: false,
  },
  'json.pretty': {
    type: 'bool',
    default: false,
  },
  'log.file': {
    type: 'string',
    default: ``,
  },
  'log.level': {
    type: 'choice',
    default: 'info',
    choices: [
      'info',
      'verbose',
      'debug',
      'silly',
    ],
  },
};

class glitch {
  constructor(commands, global, config) {
    this.commands = Object.assign(commands, defaultCommands);
    this.global = global;
    this.config = Object.assign(config, defaultConfig);

    this.banner = '';
    this.name = '';
  }

  setBanner(banner) {
    this.banner = banner;
  }

  setName(name) {
    this.name = name;
  }

  async run() {
    Command.setAppName(this.name);

    let configFile = `${Command.getConfigDirectory()}/config.json`;
    if (yargs.argv['c'] || yargs.argv['config']) {
      configFile = yargs.argv['c'] || yargs.argv['config'];
    }

    let config = new Config(configFile, this.config);
    if (yargs.argv['ansi'] !== undefined) {
      chalk.enabled = yargs.argv['ansi'];
    } else if (!config.get('cli.colors')) {
      chalk.enabled = false;
    }

    Logger.getInstance({
      file: config.get('log.file'),
      logLevel: config.get('log.level'),
      verbosity: 'warn',
      cliTimestamp: config.get('cli.timestamp'),
      colorize: config.get('cli.colors'),
    });

    for (let name in this.commands) {
      let command = this.commands[name];
      yargs.command(name, command.desc, yargs => {
        return yargs.usage(`${command.desc}\n\n${chalk.magenta('Usage:')}\n  ${name} ${command.usage}`)
          .options(command.options)
          .options(this.global.options)
          .demand(command.demand || 0)
          .strict()
          .fail(message => {
            yargs.showHelp();
            Logger.error(message);
            Command.shutdown(1);
          });
      }, argv => {
        let cliVerbosity = 'info';
        switch (parseInt(argv.verbose)) {
          case 1:
            cliVerbosity = 'verbose';
            break;
          case 2:
            cliVerbosity = 'debug';
            break;
          case 3:
            cliVerbosity = 'silly';
            break;
          default:
            break;
        }

        if (argv.quiet) {
          cliVerbosity = 'error';
        }

        Logger.setConsoleLevel(cliVerbosity);

        // Load in the command file and run
        if (command.file) {
          let Cmd = require(command.file);
          new Cmd(config).execute(argv._.slice(1), argv);
        } else if (command.callback) {
          // Otherwise,
          command.callback(code => {
            Command.shutdown(code);
          });
        } else {
          Logger.error(`Command '${name}' does not have a valid config action`);
          Command.shutdown(1);
        }
      });
    }

    let argv = yargs
      .usage(`${chalk.cyan(this.banner)}
${chalk.cyan(this.name)} version ${chalk.magenta()}

${chalk.magenta('Usage:')}
  $0 command [flags] [options] [arguments]`)
      .help('h')
      .alias('h', 'help')
      .alias('V', 'version')
      .updateStrings({
        'Commands:': chalk.magenta('Commands:'),
        'Flags:': chalk.magenta('Flags:'),
        'Options:': chalk.magenta('Options:'),
        'Global Flags:': chalk.magenta('Global Flags:'),
      })
      .options(this.global.options)
      // .epilog(`Copyright ${new Date().getFullYear()}`)
      .strict()
      .fail((message) => {
        yargs.showHelp();
        Logger.error(message);
        Command.shutdown(1);
      })
      .recommendCommands()
      .argv;

    if (!argv._[0]) {
      yargs.showHelp();
    } else {
      if (!this.commands[argv._[0]]) {
        yargs.showHelp();
        Command.shutdown(1);
      }
    }
  }
}

module.exports = glitch;
