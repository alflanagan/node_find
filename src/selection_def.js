/** @module selection_def */
/**
 * Provides a SelectionDef that represents a set of criteria for
 * selecting or rejecting a directory entry.
 *
 * The intent is to separate the operation of selecting a file from
 * all the machinery for handling arguments, traversing directories,
 * etc.
 *
 * @license GPL-3
 * @author A. Lloyd Flanagan
 * @copyright 2018-2019
 *
 */

import R from 'ramda'
import micromatch from 'micromatch'
import { basename } from 'path'

/**
 * Returns a new object whose key/value pairs are the set of pairs in `source` for which the key is in
 * `keySet`.
 *
 * @param {Set<String>} keySet
 * @param {Object} source
 */
function filterKeys (keySet, source) {
  const dest = {}
  for (let key of R.keys(source)) {
    if (keySet.has(key)) {
      dest[key] = source[key]
    }
  }
  return dest
}

/**
 * Does the filename of the directory entry in `fspec` match a pattern?
 *
 * @param {string} pattern A pattern expression compatible with micromatch (https://github.com/micromatch/micromatch)
 * @param {Object} fspec Single directory entry specification (@see
 *                       FilteredDirectoryTree.iterator)
 */
function pathMatches (pattern, fspec) {
  if (pattern === '*') return true // optimization
  const theMatch = micromatch.match(basename(fspec.name), pattern)
  return R.not(R.isEmpty(theMatch))
}

/**
 * Is the file specified by `fspec` of the type indicated by `typeChar`?
 *
 * @param {string} typeChar One of the characters legal for the --type flag.
 * @param {Object} fspec Single directory entry specification (@see
 *                       FilteredDirectoryTree.iterator)
 */
function isFileOfType (typeChar, fspec) {
  if (R.isNil(typeChar)) return true
  const s = fspec.stats
  console.log(`Checking file type ${typeChar}`)
  console.log(s)
  console.log(s.isFile)
  return ({
    'd': s.isDirectory,
    'f': s.isFile,
    'b': s.isBlockDevice,
    'c': s.isCharacterDevice,
    'l': s.isSymbolicLink,
    'p': s.isFIFO,
    's': s.isSocket,
    '*': () => true
  }[typeChar]())
}

export class SelectionDef {
  /**
   * Creates an object to filter directory entries based on the keys
   * and values in specs.
   *
   * @param {Object} specs Object with one or more valid keys whose
   *     values will be used to select directory entries
   *
   */
  constructor (specs) {
    this._acceptedKeys = new Set(['type', 'name', 'debug', 'accessed', 'modified', 'created'])
    this.conf = filterKeys(this._acceptedKeys, specs)
    this.debugMsg('SelectionDef()', this.conf)
    // no keys is OK -- selects everything
  }

  /** list of keys which are germane to this object */
  get acceptedKeys () {
    return this._acceptedKeys
  }

  /**
   * Print message(s) to stdout if `debug` is set to `true` in the configuriation.
   *
   * @param {string} msg A debugging message to be printed.
   * @param {any} optional Optional additional information to be printed, esp. useful for data whose
   *                       `toString()` is actually less informative than calling `console.log()` directly.
   */
  debugMsg (msg, optional) {
    if (this.conf.debug) {
      console.log(msg)
      if (!R.isNil(optional)) {
        console.log(optional)
      }
    }
  }

  /**
   * Determine whether a file is "selected" by the criteria of this
   * object.
   *
   * @param fspec {Object} Single directory entry specification (@see
   *                       FilteredDirectoryTree.iterator)
   */
  selects (fspec) {
    this.debugMsg('selects checking ', fspec)

    if (R.has('name', this.conf) && !pathMatches(this.conf.name, fspec)) { return false }

    this.debugMsg(`selects() checking if ${fspec.name} is of type ${this.conf.type}`)

    if (!isFileOfType(this.conf.type, fspec)) { return false }

    return true // passed all tests
  }
}
