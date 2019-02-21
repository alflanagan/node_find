/** @module filtered_dir_tree */
/**
 * Provides a `FilteredDirectoryTree` object that represents a set of directory entries.
 *
 * @license GPL-3
 * @author A. Lloyd Flanagan
 * @copyright 2016-2019
 *
 */

import { statPromise, readdirPromise } from './fs_promise'
import R from 'ramda'

/**
 * An iterable tree of those directory entries which meet the criteria
 * set by command-line arguments.
 *
 * This object will model the tree of all the directory entries
 * starting at a given path, possibly restricted by options like
 * -prune or -depth.
 *
 * We have, in general, three types of command-line arguments: those
 * that select/exclude certain directory entries, those that specify
 * actions to take on those entries, and those that affect the search
 * process itself. The last group are implemented by this class.
 *
 * @param {Object} args - The command-line arguments. The object
 *     should be the result of a call to the [yargs]{@link
 *     https://www.npmjs.com/package/yargs} library. NOTE: validation is
 *     assumed to have been performed by yargs.
 *
 */

export class FilteredDirectoryTree {
  constructor (args) {
    this.conf = args
    this.path = args._[0]
    this.debugMsg(`created FilteredDirectoryTree('${this.path}')`)
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
   * Use `selections` to filter the directory tree. Apply any actions in `actions`
   * to any selected directory entries.
   *
   * @param {SelectionDef} selections Criteria for selecting a set of directory entries.
   * @param {Action} actions Definitions of actions to be taken.
   */
  process (selections, actions) {
    return this._process(selections, actions, this.path, 0)
  }

  /**
   * 'private' recursive implementation for `process()`.
   */
  _process (selections, actions, apath, depth) {
    statPromise(apath).then((stats) => {
      if (selections.selects(stats)) {
        this.debugMsg(`${stats.name}: ${stats.stats.mode}`)
        actions.takeAction(stats)
      }

      if (stats.stats.isDirectory()) {
        if (this.conf.maxdepth === -1 || this.conf.maxdepth <= depth) {
          readdirPromise(stats.name).then((flist) => {
            flist.forEach((fname) => {
              const fullname = `${stats.name}/${fname}`
              this.debugMsg(`Recursing into directory ${fullname}`)
              this._process(selections, actions, fullname, depth + 1)
            })
          }).catch((e) => {
            if (e.code !== 'EPERM' && e.code !== 'EBUSY') {
              console.error(`Can not read directory ${e.path} because ${e.message}`)
            }
          })
        }
      }
    })

    /*  stats object for reference:
      * { name: '.',
      *   stats:
      *     { dev: 46,
      *       mode: 16893,
      *       nlink: 1,
      *       uid: 1000,
      *       gid: 1000,
      *       rdev: 0,
      *       blksize: 4096,
      *       ino: 43409,
      *       size: 482,
      *       blocks: 0,
      *       atime: 2016-12-07T21:44:20.457Z,
      *       mtime: 2016-12-08T18:35:53.402Z,
      *       ctime: 2016-12-08T18:35:53.402Z,
      *       birthtime: 2016-12-08T18:35:53.402Z } }
      */
  }
}
