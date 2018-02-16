let App = require('./index.js').App;

let app = new App('test')
  .init(
  {
    // 'contest-bot': {
    //   usage: '',
    //   desc: 'Run twitter contest bot',
    //   options: {},
    //   file: '../lib/Commands/TwitterContestBotCommand'
    // },
    // 'monitor:speed': {
    //   usage: '',
    //   desc: 'Monitor internet speed',
    //   options: {},
    //   file: '../lib/Commands/InternetSpeedCommand'
    // },
    // 'monitor:vpn': {
    //   usage: '',
    //   desc: 'Check if VPN is connected',
    //   options: {},
    //   file: '../lib/Commands/MonitorVPNCommand'
    // },
    // 'screenshot': {
    //   usage: '',
    //   desc: 'Save screenshots of sites',
    //   options: {},
    //   file: '../lib/Commands/ScreenshotCommand'
    // },
    'version': {
      offline: true,
      usage: '',
      desc: false,
      options: {},
      callback: callback => {
        Logger.info(`v${pkgJson.version}`);
        callback(0);
      }
    }
  },
  {
    options: {
      h: {
        group: 'Global Flags:'
      },
      v: {
        group: 'Global Flags:',
        alias: 'verbose',
        demand: false,
        desc: 'Output verbosity: 1 for normal (-v), 2 for more verbose (-vv), and 3 for debug (-vvv)',
        type: 'count'
      },
      q: {
        group: 'Global Flags:',
        alias: 'quiet',
        demand: false,
        desc: 'Suppress all output',
        type: 'boolean'
      },
      V: {
        group: 'Global Flags:'
      }
    }
  },
  {}
);

app.setName('test');

app.run();
