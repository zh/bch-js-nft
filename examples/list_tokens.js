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

async function listNFTTokens (walletInfo) {
  try {
    // console.log(`wallet: ${JSON.stringify(wallet, null, 2)}`)
    const tokens = await nftjs.NFT.listTokens(walletInfo)
    console.log(`tokens: ${JSON.stringify(tokens, null, 2)}`)
    const groups = await nftjs.NFT.listAllGroups(walletInfo, tokens)
    console.log(`groups: ${JSON.stringify(groups, null, 2)}`)
  } catch (error) {
    console.error('error in listNFTTokens: ', error)
  }
}

listNFTTokens(walletInfo)
