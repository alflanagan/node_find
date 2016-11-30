/** @module filtered_dir_tree */
/**
 * Provides a FilteredDirectoryTree object that represents a set of directory entries.
 *
 * @license GPL-3
 * @author A. Lloyd Flanagan
 * @copyright 2016
 *
 */

import "babel-polyfill";
import {
  statPromise,
  readdirPromise
} from "./fs_promise";
import {
  Minimatch
} from "minimatch";

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
export function FilteredDirectoryTree(args) {
  // save args in easy-to-use object
  this.conf = {
    print: args.p,
    depth: args.d,
    type: args.t,
    maxdepth: args.m,
    name: new Minimatch(args.n, {}),
    path: args._
  };
  //console.log(this.conf);
}; // FilteredDirectoryTree()

FilteredDirectoryTree.prototype.iterator = function () {
  return this.selected(this.conf.path, this.conf.maxdepth);
}

FilteredDirectoryTree.prototype.selected = function (direntry, depth) {
  // get fstats for direntry
  // if direntry.isDirectory and this.conf.depth, recurse
  // if direntry matches criteria, yield direntry
  // if direntry.isDirectory and not this.conf.depth, recurse
  var that = this // can't use arrow notation with generator
  statPromise(direntry)
    .then(
      function* (fstats) {
        if (!that.conf.depth && that.entry_matches(direntry, fstats)) {
          yield direntry;
        }
        console.log(`checked direentry ${direntry}`);
        if (fstats.isDirectory() && depth >= 0) {
          readdirPromise(direntry)
            .then(
              function* (filelist) {
                while (filelist.length > 0) {
                  yield * that.selected(filelist.pop(), depth - 1);
                }
                // must occur after yield of directory contents
                if (that.conf.depth && that.entry_matches(direntry, fstats)) {
                  yield direntry;
                }
              },
              function (err) {
                throw `Got error in my_generator: ${err}.`
              }
            )
        } else {
          // must occur even if we didn't recurse
          if (that.conf.depth && that.entry_matches(direntry, fstats)) {
            yield direntry;
          }
        };
      });
};

FilteredDirectoryTree.prototype.entry_matches = function (direntry, fstats) {
  if (!this.is_type_match(fstats)) {
    return false;
  }
  if (!this.conf.name.match(direntry)) {
    return false;
  }
  return true;
}

/**
 * Determines whether a file status matches a user-supplied type letter.
 *
 * @param {fs.Stat} fstat - An [fs.Stat]{@link https://nodejs.org/dist/latest/docs/api/fs.html#fs_class_fs_stats} object from.
 *
 * @return boolean
 *
 */
FilteredDirectoryTree.prototype.is_type_match = function (fstat) {
  switch (this.conf.type) {
  case '*':
    return true;
  case 'f':
    return fstat.isFile();
  case 'd':
    return fstat.isDirectory();
  case 'b':
    return fstat.isBlockDevice();
  case 'c':
    return fstat.isCharacterDevice();
  case 'l':
    return fstat.isSymbolicLink();
  case 'p':
    // p for pipe
    return fstat.isFIFO();
  case 's':
    return fstat.isSocket();
  default:
    return false; //never reached, we hope
  }
}
