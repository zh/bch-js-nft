/*
  Create an HDNode wallet using bch-js. The mnemonic from this wallet
  will be used by later examples.
  */

const BCHJSNFT = require('../src/bch-js-nft')
  /*const nftjs = new BCHJSNFT({
  slpdbURL: SLPDB_API,
  apiToken: process.env.BCHJSTOKEN
})*/
const nftjs = new BCHJSNFT()
const bchjs = nftjs.BCH

const fs = require('fs')
const path = require('path')
const lang = 'english' // Set the language of the wallet.

// These objects used for writing wallet information out to a file.
let outStr = ''
const outObj = {}

async function createWallet () {
  try {
    // create 256 bit BIP39 mnemonic
    const mnemonic = bchjs.Mnemonic.generate(
      128,
      bchjs.Mnemonic.wordLists()[lang]
    )
    console.log('BIP44 BCH Wallet')
    outStr += 'BIP44 BCH Wallet\n'
    console.log(`128 bit ${lang} BIP39 Mnemonic: `, mnemonic)
    outStr += `\n128 bit ${lang} BIP32 Mnemonic:\n${mnemonic}\n\n`
    outObj.mnemonic = mnemonic

    // root seed buffer
    const rootSeed = await bchjs.Mnemonic.toSeed(mnemonic)

    // master HDNode
    const masterHDNode = bchjs.HDNode.fromSeed(rootSeed)

    // HDNode of BIP44 account
    console.log('BIP44 Account: "m/44\'/245\'/0\'"')
    outStr += 'BIP44 Account: "m/44\'/245\'/0\'"\n'
    const childNode = masterHDNode.derivePath(`m/44'/245'/0'/0/0`)
    outObj.cashAddress = bchjs.HDNode.toCashAddress(childNode)
    outObj.slpAddress = bchjs.SLP.Address.toSLPAddress(outObj.cashAddress)
    outObj.legacyAddress = bchjs.HDNode.toLegacyAddress(childNode)
    outObj.WIF = bchjs.HDNode.toWIF(childNode)
    outObj.publicKey = bchjs.HDNode.toPublicKey(childNode).toString('hex')

    savePath = path.join(__dirname, 'wallet.json')
    // Write out the basic information into a json file for other example apps to use.
    fs.writeFile(savePath, JSON.stringify(outObj, null, 2), function (err) {
      if (err) return console.error(err)
      console.log('wallet.json written successfully.')
    })
  } catch (err) {
    console.error('Error in createWallet(): ', err)
  }
}
createWallet()
