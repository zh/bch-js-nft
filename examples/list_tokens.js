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

async function listNFTTokens (walletInfo) {
  try {
    // console.log(`wallet: ${JSON.stringify(wallet, null, 2)}`)
    const tokens = await bchjs.NFT.listTokens(walletInfo)
    console.log(`tokens: ${JSON.stringify(tokens, null, 2)}`)
    const groups = await bchjs.NFT.listAllGroups(walletInfo, tokens)
    console.log(`groups: ${JSON.stringify(groups, null, 2)}`)
  } catch (error) {
    console.error('error in listNFTTokens: ', error)
  }
}

listNFTTokens(walletInfo)
