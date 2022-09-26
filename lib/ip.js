const { networkInterfaces } = require('node:os')

function getIPAddresses() {
  const addresses = {}
  const nets = networkInterfaces()
  for (const name of Object.keys(nets))
    for (const net of nets[name])
      if (net.family === 'IPv4' && !net.internal) {
        if (!addresses[name])
          addresses[name] = []
        addresses[name].push(net.address)
      }
  return addresses
}

module.exports = {
  getIPAddresses
}