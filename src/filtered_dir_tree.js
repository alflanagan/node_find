/** @module filtered_dir_tree */
/**
 * Provides a FilteredDirectoryTree object that represents a set of directory entries.
 *
 * @license GPL-3
 * @author A. Lloyd Flanagan
 * @copyright 2016
 *
 */

const fsPromise = require('./fs_promise')
const statPromise = fsPromise.statPromise
const readdirPromise = fsPromise.readdirPromise
const Minimatch = require('minimatch')
const errors = require('./errors')

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
 *     should be the result of a call to the [`yargs`]{@link
 *     https://www.npmjs.com/package/yargs} library.
 *
 */

module.exports = class FilteredDirectoryTree {
  constructor (args) {
    this.conf = {}
    // get only configuration specs that matter to this object
    this._acceptedKeys = new Set(['maxdepth', 'depth', '_', 'debug'])
    for (let key in args) {
      if (this._acceptedKeys.has(key)) {
        this.conf[key] = args[key]
      }
    }
    if (args._.length !== 1) {
      throw new errors.ArgumentError("Don't know how to handle " + args._.length + ' non-hyphenated arguments!')
    }
    this.conf['path'] = args._[0]
    this.debugMsg(`created FilteredDirectoryTree('${this.conf.path}')`)
  }

  get acceptedKeys () {
    return this._acceptedKeys
  }

  debugMsg (msg) {
    if (this.conf.debug) {
      console.log(msg)
    }
  }

  process (selections, actions, apath, depth) {
    if (apath === undefined) {
      this.debugMsg(`FilteredDirectoryTree.process(,,)`)
    } else {
      this.debugMsg(`FilteredDirectoryTree.process(,, '${apath}')`)
    }
    depth = depth || 0
    statPromise(apath || this.conf.path).then((stats) => {
      /*
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
      if (selections.selects(stats)) {
        this.debugMsg(stats.name, stats.stats.mode)
        actions.takeAction(stats)
      }
      if (stats.stats.isDirectory()) {
        if (!('maxdepth' in this.conf && this.conf.maxdepth !== -1 && this.conf.maxdepth < depth)) {
          readdirPromise(stats.name).then((flist) => {
            flist.forEach((fname) => {
              this.process(selections, actions, stats.name + '/' + fname, depth + 1)
            })
          }).catch((e) => {
            if (e.code !== 'EPERM' && e.code !== 'EBUSY') {
              console.error(`Can not read directory ${e.path} because ${e.message}`)
            }
          })
        }
      }
    }).catch((e) => {
      // TODO: add argument to turn these off
      if (e.code !== 'EPERM' && e.code !== 'EBUSY') {
        console.error(`Can not read file ${e.path} because ${e.message}`)
      }
    })
  }
}
