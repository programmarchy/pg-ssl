'use strict'

var chai = require('chai')
var expect = chai.expect
chai.should()

var parseSsl = require('../').parseSsl

describe('parseSsl', function () {
  beforeEach(function () {
    delete process.env.PGSSLROOTCERT
    delete process.env.PGSSLCERT
    delete process.env.PGSSLKEY
  })

  it('returns false when process.env.PGSSLMODE is disabled', function () {
    process.env.PGSSLMODE = 'disable'
    var ssl = parseSsl()
    ssl.should.equal(false)
  })

  it('returns false when option sslmode is disabled', function () {
    var ssl = parseSsl({ sslmode: 'disable' })
    ssl.should.equal(false)
  })

  it('returns false when option sslmode overrides process.env.PGSSLMODE', function () {
    process.env.PGSSLMODE = 'woop'
    var ssl = parseSsl({ sslmode: 'disable' })
    ssl.should.equal(false)
  })

  it('returns false when neither sslrootcert, sslcert, nor sslkey are specified', function () {
    process.env.PGSSLMODE = 'blah'
    var ssl = parseSsl()
    ssl.should.equal(false)
  })

  it('returns false when process.env.SSLMODE is disabled even if other options are specified', function () {
    process.env.PGSSLMODE = 'disable'
    process.env.PGSSLROOTCERT = __dirname + '/bad.ca'
    process.env.PGSSLCERT = __dirname + '/to-the.cert'
    process.env.PGSSLKEY = __dirname + '/bone.key'
    var ssl = parseSsl()
    ssl.should.equal(false)
  })

  it('parses process.env.PGSSLROOTCERT', function () {
    process.env.PGSSLMODE = 'verify-ca'
    process.env.PGSSLROOTCERT = __dirname + '/example.ca'
    var ssl = parseSsl()
    ssl.should.not.equal(false)
    ssl.ca.should.equal('example ca\n')
  })

  it('parses process.env.PGSSLCERT', function () {
    process.env.PGSSLMODE = 'verify-ca'
    process.env.PGSSLCERT = __dirname + '/example.cert'
    var ssl = parseSsl()
    ssl.should.not.equal(false)
    ssl.cert.should.equal('example cert\n')
  })

  it('parses process.env.PGSSLKEY', function () {
    process.env.PGSSLMODE = 'verify-ca'
    process.env.PGSSLKEY = __dirname + '/example.key'
    var ssl = parseSsl()
    ssl.should.not.equal(false)
    ssl.key.should.equal('example key\n')
  })

  it('parses option sslrootcert', function () {
    process.env.PGSSLMODE = 'xyz'
    var ssl = parseSsl({ sslrootcert: __dirname + '/example.ca' })
    ssl.should.not.equal(false)
    ssl.ca.should.equal('example ca\n')
  })

  it('parses option sslcert', function () {
    process.env.PGSSLMODE = 'xyz'
    var ssl = parseSsl({ sslcert: __dirname + '/example.cert' })
    ssl.should.not.equal(false)
    ssl.cert.should.equal('example cert\n')
  })

  it('parses option sslkey', function () {
    process.env.PGSSLMODE = 'xyz'
    var ssl = parseSsl({ sslkey: __dirname + '/example.key' })
    ssl.should.not.equal(false)
    ssl.key.should.equal('example key\n')
  })

  it('overrides process.env with options', function () {
    process.env.PGSSLMODE = 'disable'
    process.env.PGSSLROOTCERT = __dirname + '/bad.ca'
    process.env.PGSSLCERT = __dirname + '/example.cert'
    process.env.PGSSLKEY = __dirname + '/bone.key'
    var ssl = parseSsl({
      sslmode: 'anything-but-disabled',
      sslrootcert: __dirname + '/example.ca',
      sslkey: __dirname + '/example.key'
    })
    ssl.should.not.equal(false)
    ssl.ca.should.equal('example ca\n')
    ssl.cert.should.equal('example cert\n')
    ssl.key.should.equal('example key\n')
  })

  it('defaults rejectUnauthorized to true', function () {
    process.env.PGSSLMODE = 'foo'
    var ssl = parseSsl({ sslrootcert: __dirname + '/example.ca' })
    ssl.should.not.equal(false)
    ssl.rejectUnauthorized.should.equal(true)
  })

  it('can override rejectUnauthorized', function () {
    process.env.PGSSLMODE = 'foo'
    var ssl = parseSsl({
      sslrootcert: __dirname + '/example.ca',
      rejectUnauthorized: false
    })
    ssl.should.not.equal(false)
    ssl.rejectUnauthorized.should.equal(false)
  })

  it('parses servername', function () {
    process.env.PGSSLMODE = 'wee'
    var ssl = parseSsl({
      sslrootcert: __dirname + '/example.ca',
      servername: 'dude/sweet'
    })
    ssl.should.not.equal(false)
    ssl.servername.should.equal('dude/sweet')
  })

  it('parses checkServerIdentity', function () {
    process.env.PGSSLMODE = 'wee'
    var fun = function (servername, cert) {}
    var ssl = parseSsl({
      sslrootcert: __dirname + '/example.ca',
      checkServerIdentity: fun
    })
    ssl.should.not.equal(false)
    ssl.checkServerIdentity.should.equal(fun)
  })
})
