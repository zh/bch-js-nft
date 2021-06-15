// !!! Fix this before usage !!!
const groupConfig = {
  name: 'ZH NFT Tests Group',
  ticker: 'ZHGRP',
  amount: 100
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

async function createNFTGroup (walletInfo, config) {
  try {
    const groupTxId = await nftjs.NFT.createNftGroup(walletInfo, config)
    console.log(`https://explorer.bitcoin.com/bch/tx/${groupTxId}`)
  } catch (error) {
    console.error('error in createNFTGroup: ', error)
  }
}

createNFTGroup(walletInfo, groupConfig)
