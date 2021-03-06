'use strict'

const Joi = require('@hapi/joi')
const serverSecrets = require('../../lib/server-secrets')
const { BaseJsonService } = require('..')

const wheelmapSchema = Joi.object({
  node: Joi.object({
    wheelchair: Joi.string().required(),
  }).required(),
}).required()

module.exports = class Wheelmap extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'wheelmap/a',
      pattern: ':nodeId(-?[0-9]+)',
    }
  }

  static get examples() {
    return [
      {
        title: 'Wheelmap',
        namedParams: { nodeId: '26699541' },
        staticPreview: this.render({ accessibility: 'yes' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'accessibility' }
  }

  static render({ accessibility }) {
    let color
    if (accessibility === 'yes') {
      color = 'brightgreen'
    } else if (accessibility === 'limited') {
      color = 'yellow'
    } else if (accessibility === 'no') {
      color = 'red'
    }
    return { message: accessibility, color }
  }

  async fetch({ nodeId }) {
    let options
    if (serverSecrets.wheelmap_token) {
      options = {
        qs: {
          api_key: `${serverSecrets.wheelmap_token}`,
        },
      }
    }

    return this._requestJson({
      schema: wheelmapSchema,
      url: `https://wheelmap.org/api/nodes/${nodeId}`,
      options,
      errorMessages: {
        401: 'invalid token',
        404: 'node not found',
      },
    })
  }

  async handle({ nodeId }) {
    const json = await this.fetch({ nodeId })
    const accessibility = json.node.wheelchair
    return this.constructor.render({ accessibility })
  }
}
