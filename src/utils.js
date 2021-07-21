/* eslint-disable no-async-promise-executor */

'use strict'

const axios = require('axios')

class Utils {
  constructor (config) {
    this.ipfsURL = config.ipfsURL
  }

  async slpExplorerGroups () {
    try {
      const url =
        'https://raw.githubusercontent.com/blockparty-sh/slp-explorer/master/public/group_icon_repos.json'
      const options = {
        method: 'GET',
        headers: {
          'content-type': 'application/json'
        },
        url
      }
      const result = await axios(options)
      if (!result || !result.data) return []
      const groups = []
      for (const g in result.data) {
        groups.push({ id: g, url: result.data[g] })
      }
      return groups
    } catch (error) {
      console.error('Error in slpExplorerGroups: ', error)
      throw error
    }
  }

  isSlpExplorerGroup (group, allGroups) {
    if (!group) return false
    return allGroups.map((g) => g.id).includes(group)
  }

  formatDocUri (documentUri) {
    const allowedProtocols = ['ftp', 'http', 'https', 'ipfs']
    if (documentUri) {
      if (documentUri.startsWith('Qm')) return `${this.ipfsURL}${documentUri}`
      const schema = documentUri.split('://')
      if (schema[0] || allowedProtocols.includes(schema[0])) {
        if (schema[0] === 'ipfs') return `${this.ipfsURL}${schema[1]}`
        // TODO: support for other protocols (schema[0])
      }
    }
    return documentUri
  }

  async formatSlpExplorerUri (groupId, documentUri, allGroups = null) {
    const all = allGroups || await this.slpExplorerGroups()
    if (!all || !this.isSlpExplorerGroup(groupId, all)) return this.formatDocUri(documentUri)
    const slpGroup = all.filter((g) => groupId === g.id)[0]
    if (slpGroup.url.substr(-1) !== '/') slpGroup.url += '/'
    return slpGroup ? `${slpGroup.url}original/${groupId}.png` : this.formatDocUri(documentUri)
  }
}

module.exports = Utils
