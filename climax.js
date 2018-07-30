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
      file: './ConfigCommand',
    },
    'delete-everything': {
      usage: '',
      desc: 'Remove all files and folders related to the CLI',
      options: {},
      file: './DeleteEverythingCommand',
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
  },
  defaultGlobal = {
    h: {
      group: 'Global Flags:',
      global: true,
    },
    v: {
      group: 'Global Flags:',
      alias: 'verbose',
      demand: false,
      desc: 'Output verbosity (-v, -vv, -vvv)',
      type: 'count',
      global: true,
    },
    q: {
      group: 'Global Flags:',
      alias: 'quiet',
      demand: false,
      desc: 'Suppress all output',
      type: 'boolean',
      global: true,
    },
    V: {
      group: 'Global Flags:',
      global: true,
    },
    ansi: {
      group: 'Global Flags:',
      demand: false,
      desc: 'Control color output',
      type: 'boolean',
      global: true,
    },
    config: {
      group: 'Global Flags:',
      demand: false,
      desc: 'Specify location of config file',
      type: 'string',
    },
  };

class climax {
  constructor(name, banner = '') {
    this.name = name;
    this.banner = banner;
  }

  init(commands = {}, config = {}, global = {}) {
    this.commands = Object.assign(defaultCommands, commands);
    this.config = Object.assign(defaultConfig, config);
    this.global = Object.assign(defaultGlobal, global);

    return this;
  }

  setBanner(banner) {
    this.banner = banner;

    return this;
  }

  setName(name) {
    this.name = name;

    return this;
  }

  addCommands(commands, yargs) {
    for (let name in commands) {
      let command = commands[name];
      yargs.command(name, command.desc, yargs => {
        let retval = yargs.usage(`${command.desc}\n\n${chalk.magenta('Usage:')}\n  ${name} ${command.usage}`)
          .options(command.options)
          .demand(command.demand || 0)
          .strict()
          .fail(message => {
            yargs.showHelp();
            Logger.error(message);
            Command.shutdown(1);
          });

        if (command.commands) {
          retval = this.addCommands(command.commands, retval);
        }

        return retval;
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
  }

  async run() {
    Command.setAppName(this.name);

    let configFile = `${Command.getConfigDirectory()}/config.json`;
    if (yargs.argv['config']) {
      configFile = yargs.argv['config'];
    }

    let config = new Config(configFile, this.config);
    if (process.stdout.isTTY && yargs.argv['ansi'] !== undefined) {
      chalk.enabled = yargs.argv['ansi'];
    } else if (!config.get('cli.colors') || !process.stdout.isTTY) {
      chalk.enabled = false;
    }

    Logger.getInstance({
      file: config.get('log.file'),
      logLevel: config.get('log.level'),
      verbosity: 'warn',
      cliTimestamp: config.get('cli.timestamp'),
      colorize: config.get('cli.colors'),
    });

    this.addCommands(this.commands, yargs);

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
      .options(this.global)
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

module.exports = climax;
