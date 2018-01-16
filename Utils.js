'use strict';

let fs = require('fs'),
  crypto = require('crypto');

class Utils {
  static convertFileSize(bytes, decimals = 2) {
    let size = bytes ? bytes : 0,
      sizes = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      factor = Math.floor((size.toString().length - 1) / 3);

    size = size / Math.pow(1024, factor);

    return parseFloat(size.toFixed(decimals)) + sizes[factor];
  }

  static pad(string, length, side) {
    if (!side) {
      side = 'right';
    }

    switch (side) {
      case 'left':
        return (string.toString().length < length) ? Utils.pad(` ${string}`, length, side) : string;
      default:
        return (string.toString().length < length) ? Utils.pad(`${string} `, length, side) : string;
    }
  }

  static sleep(seconds) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, seconds * 1000);
    });
  }
}

module.exports = Utils;
