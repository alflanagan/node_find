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
    console.log(specs)
    this._acceptedKeys = new Set(["type", "name"])
    for (let key in specs) {
      if (this._acceptedKeys.has(key)) {
        this.conf[key] = specs[key]
      }
    }
  }

  /** list of keys which are germane to this object */
  get acceptedKeys () {
    return this._acceptedKeys
  }

  /**
   * Determine whether a file is "selected" by the criteria of this
   * object.
   *
   * @param fspec {Object} Single directory entry specification (@see
   * FilteredDirectoryTree.iterator)
   */
  selects (fspec) {
    console.log(fspec)
  }
}
