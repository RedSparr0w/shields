'use strict';

const BaseService = require('../base');
const xml2js = require('xml2js');
const {
  checkErrorResponse,
  asJson,
} = require('../../lib/error-helper');
const {
  metric,
  starRating,
  addv: versionText,
} = require('../../lib/text-formatters');
const {
  downloadCount: downloadCountColor,
  floorCount: floorCountColor,
  version: versionColor,
} = require('../../lib/color-formatters');

module.exports = class Amo extends BaseService {
  async handle({type, addonId}) {
    var url = 'https://services.addons.mozilla.org/api/1.5/addon/' + addonId;

    const response = await this._sendAndCacheRequest(url).then(checkErrorResponse.asPromise({ notFoundMessage: 'project not found or access denied' }));
      //.then(asJson);

    let rating, addon;
    xml2js.parseString(response.buffer.toString(), function (err, data) {
      addon = err ? false : data.addon;
    });

    if (!addon) {
      return { label: 'test', message: 'invalid', color: 'red'};
    }

    switch (type) {
      case 'v':
        var version = addon.version[0];
        return {label: 'mozilla add-on', message: versionText(version), color: versionColor(version)};
        break;
      case 'd':
        var downloads = parseInt(addon.total_downloads[0], 10);
        return {label: 'downloads', message: metric(downloads), color: downloadCountColor(downloads)};
        break;
      case 'rating':
        rating = parseInt(addon.rating, 10);
        return {label: 'rating', message: rating + '/5', color: floorCountColor(rating, 2, 3, 4)};
        break;
      case 'stars':
        rating = parseInt(addon.rating, 10);
        return {label: 'stars', message: starRating(rating), color: floorCountColor(rating, 2, 3, 4)};
        break;
      case 'users':
        var dailyUsers = parseInt(addon.daily_users[0], 10);
        return {label: 'users', message: metric(dailyUsers), color: 'brightgreen'};
        break;
    }
    return { label: 'failed', message: 'reached 2nd end without selecting option', color: 'red'};
  }

  // Metadata
  static get category() {
    return 'other';
  }

  static get url() {
    return {
      base: 'amo',
      format: '(v|d|rating|stars|users)\/(.*)',
      capture: ['type', 'addonId']
    };
  }

  static get examples() {
    return [
      {
        previewUrl: 'gruntjs/grunt',
      },
      {
        title: 'branch',
        previewUrl: 'gruntjs/grunt/master',
      },
    ];
  }
};
