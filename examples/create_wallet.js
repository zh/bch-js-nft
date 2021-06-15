/*
  Create an HDNode wallet using bch-js. The mnemonic from this wallet
  will be used by later examples.
  */

const BCHJS = require('@psf/bch-js')
const bchjs = new BCHJS()
// const bchjs = new BCHJS({ apiToken: process.env.BCHJSTOKEN })

const BCHJSNFT = require('../src/bch-js-nft')
/* const nftjs = new BCHJSNFT({
   bchjs,
   slpdbURL: SLPDB_API
}) */
const nftjs = new BCHJSNFT({ bchjs })
const bchlib = nftjs.BCH

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
    outStr += `128 bit ${lang} BIP32 Mnemonic:\n${mnemonic}\n`
    outObj.mnemonic = mnemonic

    // root seed buffer
    const rootSeed = await bchlib.Mnemonic.toSeed(mnemonic)

    // master HDNode
    const masterHDNode = bchlib.HDNode.fromSeed(rootSeed)

    // HDNode of BIP44 account
    outStr += 'BIP44 Account: "m/44\'/245\'/0\'"\n'
    const childNode = masterHDNode.derivePath(`m/44'/245'/0'/0/0`)
    outObj.cashAddress = bchlib.HDNode.toCashAddress(childNode)
    outObj.slpAddress = bchlib.SLP.Address.toSLPAddress(outObj.cashAddress)
    outObj.legacyAddress = bchlib.HDNode.toLegacyAddress(childNode)
    outObj.WIF = bchlib.HDNode.toWIF(childNode)
    outObj.publicKey = bchlib.HDNode.toPublicKey(childNode).toString('hex')
    outStr += JSON.stringify(outObj, null, 2)
    console.log(outStr)

    const savePath = path.join(__dirname, 'wallet.json')
    fs.writeFile(savePath, JSON.stringify(outObj, null, 2), function (err) {
      if (err) return console.error(err)
      console.log('wallet.json written successfully.')
    })
  } catch (err) {
    console.error('Error in createWallet(): ', err)
  }
}
createWallet()
