/* eslint-disable no-async-promise-executor */

'use strict'

const DEFAULT_SLPDB_URL = 'https://slpdb.fountainhead.cash/'

const BCHJS = require('@psf/bch-js')
const NFT = require('./nft')

class BCHJSNFT {
  constructor (config) {
    if (!config || !config.bchjs) {
      throw new Error(
        'bch-js instance must be passed in the config object when instantiating.'
      )
    }
    this.BCH = config.bchjs

    const tmp = {}
    if (!config || !config.slpdbURL) tmp.slpdbURL = DEFAULT_SLPDB_URL
    else tmp.slpdbURL = config.slpdbURL
    const thisConfig = {
      slpdbURL: tmp.slpdbURL,
      bchjs: this.BCH
    }

    this.NFT = new NFT(thisConfig)
  }
}

module.exports = BCHJSNFT
