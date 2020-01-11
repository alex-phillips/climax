const { App } = require('./index.js');
const Command = require('./Command');
const Logger = require('./Logger');
const pkgJson = require('./package.json');

const app = new App('test')
  .init(
    {
      'spinner': {
        usage: '',
        desc: false,
        options: {},
        func: async () => {
          Command.startSpinner();
          await new Promise(r => {
            setTimeout(r, 10000);
          });

          Command.stopSpinner();
        },
      },
      'version': {
        usage: '',
        desc: false,
        options: {},
        func: async (cmd, args) => {
          Logger.info(`v${pkgJson.version}`);
        },
      },
    },
    {
      options: {
        h: {
          group: 'Global Flags:',
        },
        v: {
          group: 'Global Flags:',
          alias: 'verbose',
          demand: false,
          desc: 'Output verbosity: 1 for normal (-v), 2 for more verbose (-vv), and 3 for debug (-vvv)',
          type: 'count',
        },
        q: {
          group: 'Global Flags:',
          alias: 'quiet',
          demand: false,
          desc: 'Suppress all output',
          type: 'boolean',
        },
        V: {
          group: 'Global Flags:',
        },
      },
    },
  );

app.setName('test');

app.run();
