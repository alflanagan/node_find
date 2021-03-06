/** test suite for fs_promise node module */
/* global
   describe, expect, it, fail */

'use strict'

import { statPromise, readdirPromise } from '../fs_promise'
import os from 'os'

const UNIX_NO_FILE = -2
const DOS_NO_FILE = -4058

function notFoundCode () {
  return (os.platform() === 'win32') ? DOS_NO_FILE : UNIX_NO_FILE
}

describe('function readdirPromise', function () {
  describe('read a directory', function () {
    // note call to done() is required to ensure Promise is fulfiiled or rejected before test
    // completes.
    it('should be able to find files', function (done) {
      let wasFulfilled = false
      const promise = readdirPromise('.')
      promise
        .then(function (filelist) {
          expect(filelist).toContain('package.json')
          wasFulfilled = true
        })
        .catch(function (err) {
          fail(`Promise rejected: ${err}`)
        })
        .then(function () {
          // verify that we executed fulfillment function
          expect(wasFulfilled).toBe(true)
          done()
        })
        .catch(function (err) {
          fail(`second then rejected, ${err}`) // uh, what?
        })
    })

    it("should reject if the directory doesn't exist", function (done) {
      let wasRejected = false
      readdirPromise('fred')
        .then(function () {
          fail('Promise was fulfilled with non-existent directory fred/.')
        })
        .catch(function (err) {
          wasRejected = true
          expect(err.errno).toBe(notFoundCode())
          expect(err.code).toBe('ENOENT')
        })
        .then(function () {
          // verify we executed failure function
          expect(wasRejected).toBe(true)
          done()
        })
    })
  }) // describe()
})

describe('function statPromise', function () {
  describe('get file status', function () {
    it('should get status for normal file', function (done) {
      let wasFulfilled = false
      const promise = statPromise('package.json')
      promise
        .then(
          function (fstats) {
            expect(fstats.name).toEqual('package.json')
            expect(fstats.stats.isFile()).toBe(true)
            expect(fstats.stats.isDirectory()).toBe(false)
            expect(fstats.stats.atimeMs).toBeGreaterThan(1.4e11)
            expect(fstats.stats.ctimeMs).toBeGreaterThan(1.4e11)
            expect(fstats.stats.mtimeMs).toBeGreaterThan(1.4e11)
            wasFulfilled = true
          })
        .catch(function (err) {
          fail(`Promise rejected with error ${err}.`)
        })
        .then(
          function () {
            // verify fulfill function ran
            expect(wasFulfilled).toBe(true)
            done()
          })
    })

    it('should reject if a file does not exist', function (done) {
      let wasRejected = false
      const noSuchFileName = 'this_file_must_not_exist.ever'
      const promise = statPromise(noSuchFileName)
      promise
        .then(
          function (fstats) {
            fail(`Somehow we read stats for a non-existent file: ${noSuchFileName}`)
          })
        .catch(function (err) {
          wasRejected = true
          expect(err.errno).toBe(notFoundCode())
          expect(err.code).toBe('ENOENT')
        })
        .then(
          function () {
            // verify rejection code ran
            expect(wasRejected).toBe(true)
            done()
          })
    })

    it('should get status for a directory', function (done) {
      let wasFulfilled = false
      const promise = statPromise('.')
      promise
        .then(
          function (fstats) {
            expect(fstats.name).toEqual('.')
            expect(fstats.stats.isFile()).toBe(false)
            expect(fstats.stats.isDirectory()).toBe(true)
            expect(fstats.stats.atimeMs).toBeGreaterThan(1.4e11)
            expect(fstats.stats.ctimeMs).toBeGreaterThan(1.4e11)
            expect(fstats.stats.mtimeMs).toBeGreaterThan(1.4e11)
            wasFulfilled = true
          })
        .catch(function (err) {
          fail(`Promise rejected with error ${err}.`)
        })
        .then(
          function () {
            // verify fulfill function ran
            expect(wasFulfilled).toBe(true)
            done()
          })
    })
  }) // describe()
})
