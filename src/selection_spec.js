/** @module selection_spec */
/**
 * Provides a SelectionSpec that represents a set of criteria for
 * selecting or rejecting a directory entry.
 *
 * The intent is to separate the operation of selecting a file from
 * all the machinery for handling arguments, traversing directories,
 * etc.
 *
 * @license GPL-3
 * @author A. Lloyd Flanagan
 * @copyright 2016
 *
 */

const minimatch = require("minimatch")
const fs = require("fs")
const path = require("path")

module.exports = class SelectionSpec {

  /*
   * Creates an object to filter directory entries based on the keys
   * and values in specs.
   *
   * @param {Object} specs Object with one or more valid keys whose
   *     values will be used to select directory entries
   *
   */
  constructor(specs) {
    this.conf = {}
    this._acceptedKeys = new Set(["type", "name", "debug"])
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

  debug_msg(msg) {
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
    this.debug_msg(`selects() checking ${fspec.name} against pattern ${this.conf.name}`)
    if ("name" in this.conf) {
      let bname = path.basename(fspec.name)
      if (!minimatch(bname, this.conf.name)) {
        this.debug_msg(`selects() rejected ${fspec.name}`)
        return false;
      }
    }
    return true;  // passed all tests
  }
}
