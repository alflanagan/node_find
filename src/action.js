/** @module action */
/**
 * Provides an Action object that represents a set of actions to
 * apply to a directory entry.
 *
 * @license GPL-3
 * @author A. Lloyd Flanagan
 * @copyright 2018-2019
 *
 */

import R from 'ramda'

export class Action {
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
    const accepted = R.filter((key) => this._acceptedKeys.has(key), R.keys(actions))
    R.forEach((key => { this.conf[key] = actions[key] }, accepted))
    // if no other action is chosen, default is --print
    if (R.isEmpty(R.keys(this.conf))) { this.conf.print = true }
  }

  /** list of valid keys accepted */
  get acceptedKeys () {
    return this._acceptedKeys
  }

  debugMsg (msg) {
    if (this.conf.debug) {
      console.log(msg)
    }
  }

  takeAction (fspec) {
    if (R.has('print', this.conf)) {
      console.log(fspec.name)
    }
  }
}
