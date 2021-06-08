// const axios = require('axios')

const DUST = 546

const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec))

class NFT {
  constructor (config) {
    this.slpdbURL = config.slpdbURL
    this.bchjs = config.bchjs
    this.txFee = config.txFee || 450
  }

  async listTokens (wallet, validate = false) {
    const utxos = await this.bchjs.Utxo.get(wallet.slpAddress, validate)
    if (!utxos || !utxos[0] || !utxos[0].slpUtxos || !utxos[0].slpUtxos.nft) return {}
    return utxos[0].slpUtxos.nft
  }

  async listAllGroups (wallet, allTokens = null) {
    const all = allTokens || await this.listTokens(wallet)
    if (!all || !all.groupTokens) return {}
    return all.groupTokens
  }

  async listAllChildren (wallet, allTokens = null) {
    const all = allTokens || await this.listTokens(wallet)
    if (!all || !all.tokens) return {}
    return all.tokens
  }

  async listAllMintBatons (wallet, allTokens = null) {
    const all = allTokens || await this.listTokens(wallet)
    if (!all || !all.groupMintBatons) return {}
    return all.groupMintBatons
  }

  async findPaymentUtxo (address) {
    try {
      const utxos = await this.bchjs.Utxo.get(address)
      const paymentUtxo = this.bchjs.Utxo.findBiggestUtxo(utxos[0].bchUtxos)
      if (!paymentUtxo) throw new Error('Not enough funds')
      return paymentUtxo
    } catch (error) {
      console.error('Error in findPaymentUtxo: ', error)
      throw error
    }
  }

  async findBurnUtxo (wallet, groupId, allTokens = null) {
    const allGroups = await this.listAllGroups(wallet, allTokens)
    const groupUtxos = allGroups.filter((g) => {
      if (g.tokenId === groupId && g.tokenQty === '1') return true
      return false
    })
    if (!groupUtxos || groupUtxos.length === 0) return null
    return groupUtxos[0]
  }

  async createNftGroup (wallet, config, allTokens = null) {
    try {
      const all = allTokens || await this.listTokens(wallet)
      if (!all) return {}
      let tickerName
      if (config.ticker) {
        tickerName = config.ticker
      } else {
        tickerName = config.prefix ? `${config.prefix}.${config.name}` : config.name
      }
      const docURL = config.url || 'https://github.com/zh/bch-js-nft'
      const docHash = config.hash || ''
      const mintConfig = {
        name: config.name,
        ticker: tickerName,
        documentUrl: docURL,
        documentHash: docHash,
        mintBatonVout: 2,
        initialQty: config.amount || 1000
      }
      // console.log(`config: ${JSON.stringify(mintConfig, null, 2)}`)
      const legacyAddress = this.bchjs.SLP.Address.toLegacyAddress(wallet.slpAddress)
      const paymentUtxo = await this.findPaymentUtxo(legacyAddress)

      const script = this.bchjs.SLP.NFT1.newNFTGroupOpReturn(mintConfig)
      const originalAmount = paymentUtxo.value
      const remainder = originalAmount - (2 * DUST) - this.txFee // group + baton

      const outputs = [
        { address: script, value: 0 },
        { address: legacyAddress, value: DUST },
        { address: legacyAddress, value: DUST },
        { address: legacyAddress, value: remainder }
      ]
      const inputs = [
        { txid: paymentUtxo.tx_hash, pos: paymentUtxo.tx_pos, value: originalAmount }
      ]

      return this.constructTx(wallet.WIF, inputs, outputs)
    } catch (error) {
      console.error('Error in createNftGroup: ', error)
      throw error
    }
  }

  // group token with qty = 1 for creating child
  async mintNftGroup (wallet, groupId, allTokens = null) {
    try {
      if (!groupId) throw new Error('Please provide group ID')
      const allBatons = await this.listAllMintBatons(wallet, allTokens)
      if (!allBatons) throw new Error('No baton UTXOs available')
      const baton = allBatons.filter((b) => b.tokenId === groupId)
      if (!baton || baton.length === 0) throw new Error(`No ${groupId} group baton available`)
      // console.log(`baton: ${JSON.stringify(baton, null, 2)}`)

      const legacyAddress = this.bchjs.SLP.Address.toLegacyAddress(wallet.slpAddress)
      const paymentUtxo = await this.findPaymentUtxo(legacyAddress)

      const script = this.bchjs.SLP.NFT1.mintNFTGroupOpReturn(baton, 1)
      const originalAmount = paymentUtxo.value
      const remainder = originalAmount - (2 * DUST) - this.txFee // group + baton

      const outputs = [
        { address: script, value: 0 },
        { address: legacyAddress, value: DUST },
        { address: legacyAddress, value: DUST },
        { address: legacyAddress, value: remainder }
      ]
      const inputs = [
        { txid: paymentUtxo.tx_hash, pos: paymentUtxo.tx_pos, value: originalAmount },
        { txid: baton[0].tx_hash, pos: baton[0].tx_pos, value: DUST }
      ]
      return this.constructTx(wallet.WIF, inputs, outputs)
    } catch (error) {
      console.error('Error in mintNftGroup: ', error)
      throw error
    }
  }

  async sendNftToken (toAddress, wallet, tokenId, tokenUtxos) {
    try {
      const legacyToAddress = this.bchjs.SLP.Address.toLegacyAddress(toAddress)
      const legacyAddress = this.bchjs.SLP.Address.toLegacyAddress(wallet.slpAddress)
      const paymentUtxo = await this.findPaymentUtxo(legacyAddress)

      const slpSendObj = this.bchjs.SLP.NFT1.generateNFTGroupSendOpReturn(tokenUtxos, 1)
      const originalAmount = paymentUtxo.value
      const remainder = originalAmount - (2 * DUST) - this.txFee // group + baton

      const outputs = [
        { address: slpSendObj.script, value: 0 },
        { address: legacyToAddress, value: DUST }
      ]
      // Return any token change back to the sender.
      if (slpSendObj.outputs > 1) {
        outputs.push({ address: legacyAddress, value: DUST })
      }
      outputs.push({ address: legacyAddress, value: remainder })

      const inputs = [
        { txid: paymentUtxo.tx_hash, pos: paymentUtxo.tx_pos, value: originalAmount }
      ]
      // add each group token UTXO as an input.
      for (let i = 0; i < tokenUtxos.length; i++) {
        const thisUtxo = tokenUtxos[i]
        inputs.push({ txid: thisUtxo.tx_hash, pos: thisUtxo.tx_pos, value: thisUtxo.value })
      }
      return this.constructTx(wallet.WIF, inputs, outputs)
    } catch (error) {
      console.error('Error in sendNftToken: ', error)
      throw error
    }
  }

  async createBurnUtxo (wallet, groupId, allTokens = null) {
    try {
      const allGroups = await this.listAllGroups(wallet, allTokens)
      const groupUtxos = allGroups.filter((g) => g.tokenId === groupId)
      if (!groupUtxos || groupUtxos.length === 0) throw new Error(`No ${groupId} group UTXOs available`)

      return this.sendNftToken(wallet.slpAddress, wallet, groupId, groupUtxos)
    } catch (error) {
      console.error('Error in createBurnUtxo: ', error)
      throw error
    }
  }

  async createNftChild (wallet, config, allTokens = null) {
    try {
      let burnUtxo = await this.findBurnUtxo(wallet, config.group, allTokens)
      if (!burnUtxo) {
        const burnTxId = await this.createBurnUtxo(wallet, config.group, allTokens)
        console.log(`burn txid: https://explorer.bitcoin.com/bch/tx/${burnTxId}`)
        await sleep(3000)
        burnUtxo = await this.findBurnUtxo(wallet, config.group)
      }
      if (!burnUtxo) throw new Error('No burn UTXO available. Wait a little and try one more time.')
      // console.log(`burn utxo: ${JSON.stringify(burnUtxo, null, 2)}`)
      let tickerName
      if (config.ticker) {
        tickerName = config.ticker
      } else {
        tickerName = config.prefix ? `${config.prefix}.${config.name}` : config.name
      }
      const docURL = config.url || 'https://github.com/zh/bch-js-nft'
      const docHash = config.hash || ''
      const mintConfig = {
        name: config.name,
        ticker: tickerName,
        documentUrl: docURL,
        documentHash: docHash
      }

      const legacyAddress = this.bchjs.SLP.Address.toLegacyAddress(wallet.slpAddress)
      const paymentUtxo = await this.findPaymentUtxo(legacyAddress)

      const script = this.bchjs.SLP.NFT1.generateNFTChildGenesisOpReturn(mintConfig)
      const originalAmount = paymentUtxo.value
      const remainder = originalAmount - DUST - this.txFee // group + baton

      const outputs = [
        { address: script, value: 0 },
        { address: legacyAddress, value: DUST },
        { address: legacyAddress, value: remainder }
      ]
      const inputs = [
        { txid: burnUtxo.tx_hash, pos: burnUtxo.tx_pos, value: DUST },
        { txid: paymentUtxo.tx_hash, pos: paymentUtxo.tx_pos, value: originalAmount }
      ]
      return this.constructTx(wallet.WIF, inputs, outputs)
    } catch (error) {
      console.error('Error in createNftChild: ', error)
      throw error
    }
  }

  async constructTx (wif, inputs, outputs) {
    try {
      const transactionBuilder = new this.bchjs.TransactionBuilder()
      for (let i = 0; i < outputs.length; i++) {
        transactionBuilder.addOutput(outputs[i].address, outputs[i].value)
      }

      const keyPair = this.bchjs.ECPair.fromWIF(wif)
      // first add all THEN sign
      for (let i = 0; i < inputs.length; i++) {
        transactionBuilder.addInput(inputs[i].txid, inputs[i].pos)
      }
      for (let i = 0; i < inputs.length; i++) {
        transactionBuilder.sign(
          i,
          keyPair,
          undefined,
          transactionBuilder.hashTypes.SIGHASH_ALL,
          inputs[i].value
        )
      }
      const tx = transactionBuilder.build()
      const hex = tx.toHex()
      // console.log(`TX hex: ${hex}`)
      return this.bchjs.RawTransactions.sendRawTransaction([hex])
    } catch (error) {
      console.error('Error in signAndSend: ', error)
      throw error
    }
  }
}

module.exports = NFT
