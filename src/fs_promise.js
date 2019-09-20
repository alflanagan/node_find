/**
 * Promise-based wrappers around node standard 'fs' module.
 *
 * @license GPL-3
 * @author A. Lloyd Flanagan
 * @copyright 2016-2019
 *
 */

// TODO: replace Promises with folktale's Task. This would allow us to cancel (or never start) operations
// in case of an error.

const fs = require('fs')

// should be possible to write a function to wrap an async call in a Promise, assuming it follows nodes's
// library conventions for callbacks. This, however, is not quite it.
// function promisify(some_func, ...args) {
//   return new Promise(function (resolve, reject) {
//     args.push(function(err, result) {
//       if (err) reject (err);
//       resolve(result);
//     });
//     Function.prototype.apply(some_func, args);
//   });
// }

/**
 * Async read a directory.
 *
 * @param {string} dirname - Name of a directory to read.
 *
 * @returns {Promise} a promise that is fulfilled on
 *     [`fs.readdir(dirname)`]{@link https://nodejs.org/dist/latest/docs/api/fs.html#fs_fs_readdir_path_callback}.
 */
export function readdirPromise (dirname) {
  return new Promise(function (resolve, reject) {
    fs.readdir(dirname, function (err, filelist) {
      err ? reject(err) : resolve(filelist)
    })
  })
}

/**
 * Async get status of a file.
 *
 * @param {string} filename - The name of the file.
 *
 * @returns {Promise} a promise that is fulfilled on
 *     [`fs.lstat(filename)`]{@link https://nodejs.org/dist/latest/docs/api/fs.html#fs_fs_lstat_path_callback}.
 */
export function statPromise (filename) {
  return new Promise(function (resolve, reject) {
    // TODO: call stat() or fstat() based on an argument
    fs.lstat(filename, function (err, fstat) {
      err ? reject(err) : resolve({ 'name': filename, 'stats': fstat })
    })
  })
}
