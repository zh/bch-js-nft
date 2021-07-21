
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

async function getNFTMedia (walletInfo) {
  try {
    const slpData = {
      tokens: await nftjs.NFT.listAllChildren(walletInfo),
      groups: await nftjs.Utils.slpExplorerGroups()
    }
    let tokenId = '--some-nft-child-token-txid--'
    let mediaUri = await nftjs.NFT.getPayload(tokenId, walletInfo, slpData)
    console.log(mediaUri)
  } catch (error) {
    console.error('error in getNFTMedia: ', error)
  }
}

getNFTMedia(walletInfo)
