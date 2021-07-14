const removeConfig = {
  remove: '--tokenId-to-remove--'
  /*
  ,funder: {
    address: 'bitcoincash:--PUT-REAL-BCH-ADDRESS-HERE--',
    wif: '5L.....PUT-REAL-WIF-HERE--'
  }
  */
  }
}

const BCHJS = require('@psf/bch-js')
const bchjs = new BCHJS()
// const bchjs = new BCHJS({ apiToken: process.env.BCHJSTOKEN })

const BCHJSNFT = require('../src/bch-js-nft')
const nftjs = new BCHJSNFT({ bchjs })
const path = require('path')

let walletInfo
try {
  const loadPath = path.join(__dirname, 'wallet.json')
  walletInfo = require(loadPath)
} catch (err) {
  console.log(
    "Could not open wallet.json: { address: '...', wif: '...'}"
  )
  process.exit(0)
}

async function removeNFTChild (walletInfo, config) {
  try {
    const burnTxId = await nftjs.NFT.removeNftChild(walletInfo, config)
    console.log(`https://explorer.bitcoin.com/bch/tx/${burnTxId}`)
  } catch (error) {
    console.error('error in removeNFTChild: ', error)
  }
}

removeNFTChild(walletInfo, removeConfig)
