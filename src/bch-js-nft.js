/* eslint-disable no-async-promise-executor */

'use strict'

const DEFAULT_SLPDB_URL = 'https://slpdb.fountainhead.cash/'
const DEFAULT_IPFS_URL = 'https://ipfs.io/ipfs/'

const NFT = require('./nft')
const Utils = require('./utils')

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
    if (!config || !config.ipfsURL) tmp.ipfsURL = DEFAULT_IPFS_URL
    else tmp.ipfsURL = config.ipfsURL

    this.Utils = new Utils({ ipfsURL: tmp.ipfsURL })

    const thisConfig = {
      slpdbURL: tmp.slpdbURL,
      bchjs: this.BCH,
      utils: this.Utils
    }

    this.NFT = new NFT(thisConfig)
  }
}

module.exports = BCHJSNFT
