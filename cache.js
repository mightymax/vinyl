
const fs = require('fs/promises');
const cache = {
  get: async (route) => {
    const file = `./public/cache/${route}.json`
    return await fs.access(file, fs.constants.W_OK | fs.constants.R_OK)
      .then(_ => fs.stat(file))
      .then(stats => {
        const age = (new Date()).getTime() - (new Date(stats.mtime).getTime())
        if (age > 10 * 60 * 1000) {
          return Promise.reject(new Error('Cache expired'))
        }
        return fs.readFile(file, 'utf-8')
      })
      .then(txt => JSON.parse(txt))
  },
  set: async (route, cacheObject) => {
    const file = `./public/cache/${route}.json`
    return fs.writeFile(file, JSON.stringify(cacheObject))
      .then(_ => cacheObject)
      .catch(e => {
        console.error(e.message)
        return cacheObject
      })
  }
}

module.exports = cache;