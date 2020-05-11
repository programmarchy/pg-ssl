const fs = require('fs')

function parseSsl(options) {
  options = options || {}

  const sslmode = options.sslmode || process.env.PGSSLMODE

  if (sslmode === 'disable') {
    return false
  }

  const sslrootcert = options.sslrootcert || process.env.PGSSLROOTCERT
  const sslcert = options.sslcert || process.env.PGSSLCERT
  const sslkey = options.sslkey || process.env.PGSSLKEY

  if (!sslkey && !sslcert && !sslrootcert) {
    return false
  }

  const ssl = {}

  if (sslrootcert) {
    ssl.ca = fs.readFileSync(sslrootcert).toString()
  }

  if (sslcert) {
    ssl.cert = fs.readFileSync(sslcert).toString()
  }

  if (sslkey) {
    ssl.key = fs.readFileSync(sslkey).toString()
  }

  if (options.servername !== undefined) {
    ssl.servername = options.servername
  }

  if (options.checkServerIdentity !== undefined) {
    ssl.checkServerIdentity = options.checkServerIdentity
  }

  ssl.rejectUnauthorized = (options.rejectUnauthorized !== undefined) ? options.rejectUnauthorized : true

  return ssl
}

module.exports = parseSsl

parseSsl.parseSsl = parseSsl