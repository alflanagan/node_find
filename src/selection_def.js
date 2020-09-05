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
import { pathMatches } from './useful'

/**
 * Is the file specified by `fspec` of the type indicated by `typeChar`?
 *
 * @param {string} typeChar One of the characters legal for the --type flag.
 * @param {Object} fspec Single directory entry specification (@see
 *                       FilteredDirectoryTree.iterator)
 */
export function isFileOfType (typeChar, fspec) {
  if (R.isNil(typeChar)) return true
  const s = fspec.stats
  // console.log(s.isFile())
  return { // mapping from type character to boolean function
    d: () => s.isDirectory(),
    f: () => s.isFile(),
    b: () => s.isBlockDevice(),
    c: () => s.isCharacterDevice(),
    l: () => s.isSymbolicLink(),
    p: () => s.isFIFO(),
    s: () => s.isSocket(),
    '*': () => true
  }[typeChar]()
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
    this.conf = specs
  }

  /**
   * Print message(s) to stdout if `debug` is set to `true` in the configuration.
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

    if (!pathMatches(this.conf.name, fspec)) { return false }

    this.debugMsg(`selects() checking if ${fspec.name} is of type ${this.conf.type}`)

    if (!isFileOfType(this.conf.type, fspec)) { return false }

    return true // passed all tests
  }
}
