/** @module filtered_dir_tree */
/**
 * Provides a FilteredDirectoryTree object that represents a set of directory entries.
 *
 * @license GPL-3
 * @author A. Lloyd Flanagan
 * @copyright 2016
 *
 */

const fs_promise = require("./fs_promise"),
  statPromise = fs_promise.statPromise,
  readdirPromise = fs_promise.readdirPromise

const Minimatch = require("minimatch")

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
  constructor(args) {
    // save args in easy-to-use object
    this.conf = {
      print: args.p,
      depth: args.d,
      type: args.t,
      maxdepth: args.m,
      name: args.n,
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
    if (this.conf.name) {
      let nm = new Minimatch(this.conf.name, {})
      if (!nm.match(direntry)) {
        return false
      }
    }
    return true
  }

}

// FilteredDirectoryTree.prototype.iterator = function () {
//   return this.selected(this.conf.path, this.conf.maxdepth)
// }
//
// FilteredDirectoryTree.prototype[Symbol.iterator] = FilteredDirectoryTree.prototype.selected
