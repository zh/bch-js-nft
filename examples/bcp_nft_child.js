const {
  BCP_TYPE_AUDIO,
  // BCP_TYPE_VIDEO,
  BCP_SRC_URL
} = require('bcp-js')

const childConfig = {
  receiver: 'simpleledger:--some-receiver-address-here--',
  group: '--TXID-FROM-CREATE-NFT-GROUP-SCRIPT--',
  name: 'NFT BCP Tests Child',
  ticker: 'BCPHLD'
  payload: {
    // type: BCP_TYPE_VIDEO,
    type: BCP_TYPE_AUDIO,
    source: BCP_SRC_URL,
    // data: 'ipfs://QmTYqoPYf7DiVebTnvwwFdTgsYXg2RnuPrt8uddjfW2kHS' // monkey video
    data: 'ipfs://QmZmqLskJmghru919cvU4qSy3L5vc1S2JdzsUXrM17ZqT9' // rain drop audio
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

async function createNFTChild (walletInfo, config) {
  try {
    const childTxId = await nftjs.NFT.createNftChild(walletInfo, config)
    console.log(`https://explorer.bitcoin.com/bch/tx/${childTxId}`)
  } catch (error) {
    console.error('error in createNFTGroup: ', error)
  }
}

createNFTChild(walletInfo, childConfig)
