// !!! Fix this before usage !!!
const childConfig = {
  group: '--TXID-FROM-CREATE-NFT-GROUP-SCRIPT--',
  name: 'ZH NFT Tests Child',
  ticker: 'ZHCHLD'
}

const BCHJSNFT = require('../src/bch-js-nft')
const bchjs = new BCHJSNFT()
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

async function createNFTChild (walletInfo, config) {
  try {
    const childTxId = await bchjs.NFT.createNftChild(walletInfo, config)
    console.log(`https://explorer.bitcoin.com/bch/tx/${childTxId}`)
  } catch (error) {
    console.error('error in createNFTGroup: ', error)
  }
}

createNFTChild(walletInfo, childConfig)
