/** @module action_spec */
/**
 * Provides an ActionSpec object that represents a set of actions to
 * apply to a directory entry.
 *
 * @license GPL-3
 * @author A. Lloyd Flanagan
 * @copyright 2016
 *
 */

module.exports = class ActionSpec {

  /*
   * Creates an object to perform actions on one or more directory
   * entries based on keys in `actions`.
   *
   * @param {Object} actions Object whose key/values specify one or
   *     more actions to take
   */
  constructor(actions) {
    this.conf = {}
    this._acceptedKeys = new Set(["print"])
    for (let key in actions) {
      if (this._acceptedKeys.has(key)) {
        this.conf[key] = actions[key]
      }
    }
  }

  /** list of valid keys accepted */
  get acceptedKeys () {
    return this.conf
  }
}
