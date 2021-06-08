const DEFAULT_SLPDB_URL = 'https://slpdb.fountainhead.cash/'

const BCHJS = require('@psf/bch-js')
const NFT = require('./nft')

class BCHJSNFT {
  constructor (config) {
    this.BCH = new BCHJS(config)

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
