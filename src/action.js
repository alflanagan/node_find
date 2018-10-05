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

function key_count(an_obj) {
  let count = 0
  for (let key in an_obj) {
    count++
  }
  return count
}

module.exports = class ActionSpec {

  /*
   * Creates an object to perform actions on one or more directory
   * entries based on keys in `actions`.
   *
   * @param {Object} actions Object whose key/values specify one or
   *     more actions to take
   */
  constructor(actions) {
    let flag_kluge = false
    this.conf = {}
    this._acceptedKeys = new Set(["print", "debug"])
    for (let key in actions) {
      if (this._acceptedKeys.has(key)) {
        this.conf[key] = actions[key]
        flag_kluge = true
      }
    }
    // if no other action is chosen, default is --print
    if (key_count(this._acceptedKeys) === 0) {
      this.conf.print = true
    }
  }

  /** list of valid keys accepted */
  get acceptedKeys () {
    return this.conf
  }

  debug_msg(msg) {
    if (this.conf.debug) {
      console.log(msg)
    }
  }

  takeAction(fspec) {
    if ("print" in this.conf) {
      console.log(fspec.name)
    }
  }
}
