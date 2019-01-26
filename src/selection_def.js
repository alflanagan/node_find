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
 * @copyright 2018
 *
 */

const micromatch = require('micromatch')
const path = require('path')

export class SelectionDef {
  /*
   * Creates an object to filter directory entries based on the keys
   * and values in specs.
   *
   * @param {Object} specs Object with one or more valid keys whose
   *     values will be used to select directory entries
   *
   */
  constructor (specs) {
    this.conf = {}
    this._acceptedKeys = new Set(['type', 'name', 'debug'])
    for (let key in specs) {
      if (this._acceptedKeys.has(key)) {
        this.conf[key] = specs[key]
      }
    }
    // no keys is OK -- selects everything
  }

  /** list of keys which are germane to this object */
  get acceptedKeys () {
    return this._acceptedKeys
  }

  debugMsg (msg) {
    if (this.conf.debug) {
      console.log(msg)
    }
  }

  /**
   * Determine whether a file is "selected" by the criteria of this
   * object.
   *
   * @param fspec {Object} Single directory entry specification (@see
   * FilteredDirectoryTree.iterator)
   */
  selects (fspec) {
    this.debugMsg(`selects() checking ${fspec.name} against pattern ${this.conf.name}`)

    if ('name' in this.conf) {
      let bname = path.basename(fspec.name)
      if (!micromatch(bname, this.conf.name)) {
        this.debugMsg(`selects() rejected ${fspec.name}`)
        return false
      }
    } // this.conf.name

    if (this.conf.type !== '*') {
      switch (this.conf.type) {
        case 'd':
          if (!fspec.stats.isDirectory()) { return false }
          break
        case 'f':
          if (!fspec.stats.isFile()) { return false }
          break
        case 'b':
          if (!fspec.stats.isBlockDevice()) { return false }
          break
        case 'c':
          if (!fspec.stats.isCharacterDevice()) { return false }
          break
        case 'l':
          if (!fspec.stats.isSymbolicLink()) { return false }
          break
        case 'p':
          // p for pipe
          if (!fspec.stats.isFIFO()) { return false }
          break
        case 's':
          if (!fspec.stats.isSocket()) { return false }
      }
    } // this.conf.type

    return true // passed all tests
  }
}
