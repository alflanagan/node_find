/* @flow */
/* note above more a declaration of intent than actual use, so far */
"use strict";

/** @module fdr */
/**
 * Provides a FilteredDirectoryTree object that represents a set of directory entries.
 *
 * @license GPL-3
 * @author A. Lloyd Flanagan
 * @copyright 2016
 *
 */

import "babel-polyfill";
import {statPromise, readdirPromise} from "./fs_promise";
import fs from "fs";
import {Minimatch} from "minimatch";

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

}

FilteredDirectoryTree.prototype.iterator = function() {
  return my_generator(this.conf.path, this.conf.maxdepth);
}

function* my_generator (direntry, depth) {
  // get fstats for direntry
  // if direntry.isDirectory and this.conf.depth, recurse
  // if direntry matches criteria, yield direntry
  // if direntry.isDirectory and not this.conf.depth, recurse
  let fstats = statPromise(direntry);
  if (!this.conf.depth && entry_matches(direntry, fstats)) {
    yield direntry;
  }
  // TODO: check maxdepth!!
  if (fstats.isDirectory()) {
    // need to get filelist out of scope of inner function
    let fsublist = [];
    readdirPromise(direntry).then(function (filelist) {
      fsublist = filelist;
    }, function (err) {
      console.error(`Got error in my_generator: ${err}.`);
    });
    while (fsublist.length > 0) {
      yield* my_generator(fsublist.pop(), depth-1);
    }
  }
  if (this.conf.depth && entry_matches(direntry, fstats)){
    yield direntry;
  }
};

function entry_matches(direntry, fstats) {
  if (!is_type_match(fstats)) {
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
function is_type_match(fstat) {
  switch(this.conf.type) {
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
