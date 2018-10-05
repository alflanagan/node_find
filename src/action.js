/** @module action */
/**
 * Provides an Action object that represents a set of actions to
 * apply to a directory entry.
 *
 * @license GPL-3
 * @author A. Lloyd Flanagan
 * @copyright 2018
 *
 */

module.exports = class Action {
  /*
   * Creates an object to perform actions on one or more directory
   * entries based on keys in `actions`.
   *
   * @param {Object} actions Object whose key/values specify one or
   *     more actions to take
   */
  constructor (actions) {
    this.conf = {}
    this._acceptedKeys = new Set(['print', 'debug'])
    for (let key in actions) {
      if (this._acceptedKeys.has(key)) {
        this.conf[key] = actions[key]
      }
    }
    // if no other action is chosen, default is --print
    if (!('print' in this.conf) && !('debug' in this.conf)) {
      this.conf.print = true
    }
  }

  /** list of valid keys accepted */
  get acceptedKeys () {
    return this.conf
  }

  debugMsg (msg) {
    if (this.conf.debug) {
      console.log(msg)
    }
  }

  takeAction (fspec) {
    if ('print' in this.conf) {
      console.log(fspec.name)
    }
  }
}
