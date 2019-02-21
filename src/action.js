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
    this.conf = actions
    if (R.isEmpty(this.conf)) { this.conf.print = true }
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

  takeAction (fspec) {
    if (this.conf.print) {
      console.log(fspec.name)
    }
  }
}
