/** @module filtered_dir_tree */
/**
 * Provides a FilteredDirectoryTree object that represents a set of directory entries.
 *
 * @license GPL-3
 * @author A. Lloyd Flanagan
 * @copyright 2016
 *
 */

import "babel-polyfill"
import {
  statPromise,
  readdirPromise
} from "./fs_promise"
import {
  Minimatch
} from "minimatch"

/**
 * An iterable tree of those directory entries which meet the criteria set by command-line arguments.
 *
 * This object is responsible for all the command-line arguments that restrict the set of files
 * tested (--type, --name, etc.) as well as presentation order as determined by the --depth)
 * argument
 *
 * @param {Object} args - The command-line arguments. The object should be the result of a call
 *     to the [`yargs`]{@link https://www.npmjs.com/package/yargs} library.
 *
 * @returns {Object} iterator over the selected directory entries (as strings).
 *
 */

export class FilteredDirectoryTree {
  constructor(args) {
    // save args in easy-to-use object
    this.conf = {
      print: args.p,
      depth: args.d,
      type: args.t,
      maxdepth: args.m,
      name: new Minimatch(args.n, {}),
      path: args._
    }
  }

  iterator() {
    return this.selected(this.conf.path, this.conf.maxdepth)
  }

  // this ... is problematic. Async generator??
  * selected() {
    var direntry = this.conf.path,
      depth = this.conf.depth

    // get fstats for direntry
    // if direntry.isDirectory and this.conf.depth, recurse
    // if direntry matches criteria, yield direntry
    // if direntry.isDirectory and not this.conf.depth, recurse
    statPromise(direntry)
      .then(
        function* (fstats) {
          if (!this.conf.depth && this.entry_matches(direntry, fstats)) {
            yield direntry
          }
          console.log(`checked direentry ${direntry}`)
          if (fstats.isDirectory() && depth >= 0) {
            readdirPromise(direntry)
              .then(
                function* (filelist) {
                  while (filelist.length > 0) {
                    yield* this.selected(filelist.pop(), depth - 1)
                  }
                  // must occur after yield of directory contents
                  if (this.conf.depth && this.entry_matches(direntry, fstats)) {
                    yield direntry
                  }
                },
                function (err) {
                  console.error(`Got error in my_generator: ${err}.`)
                }
              )
          } else {
            // must occur even if we didn't recurse
            if (this.conf.depth && this.entry_matches(direntry, fstats)) {
              yield direntry
            }
          }
        })
  }

  is_type_match(fstat) {
    switch (this.conf.type) {
    case "*":
      return true
    case "f":
      return fstat.isFile()
    case "d":
      return fstat.isDirectory()
    case "b":
      return fstat.isBlockDevice()
    case "c":
      return fstat.isCharacterDevice()
    case "l":
      return fstat.isSymbolicLink()
    case "p":
      // p for pipe
      return fstat.isFIFO()
    case "s":
      return fstat.isSocket()
    default:
      return false //never reached, we hope
    }
  }

  entry_matches(direntry, fstats) {
    if (!this.is_type_match(fstats)) {
      return false
    }
    if (!this.conf.name.match(direntry)) {
      return false
    }
    return true
  }

}

// FilteredDirectoryTree.prototype.iterator = function () {
//   return this.selected(this.conf.path, this.conf.maxdepth)
// }
//
// FilteredDirectoryTree.prototype[Symbol.iterator] = FilteredDirectoryTree.prototype.selected
