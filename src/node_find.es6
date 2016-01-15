"use strict";

import "babel-polyfill";

var fs = require("fs");
//TODO: replace node asserts with userland assertion library
var assert = require("assert");
var path = require("path");
var argv = require("yargs")
  .demand(1)
  .alias('t', "type")
  .describe("t", "type of files to match (b, c, d, f, l)")
  .nargs("t", 1)
  .default("t", "*")
  .usage("Usage: " + path.basename(__filename) + " path [expression]\n" +
         "    path is required; default expression is -print\n" +
         "    expression may consist of: operators, options, tests, and actions:")
  .help('h')
  .alias('h', 'help')
  .argv;

/**
 * Returns true if the Fstat strcture 'fstat' has the type selectecd by 'type_letter'.
 */
function is_type_match(type_letter, fstat) {
  //arg_require_in_set(type_letter, ['b', 'c', 'd', 'f', 'l']);
  if (type_letter === 'f') {
    return fstat.isFile();
  } else if (type_letter === 'd') {
    return fstat.isDirectory();
  } else if (type_letter === 'b') {
    return fstat.isBlockDevice();
  } else if (type_letter === 'c') {
    return fstat.isCharacterDevice();
  } else if (type_letter === 'l') {
    return fstat.isSymbolicLink();
  } else if (type_letter === 'p') {
    // p for pipe
    return fstat.isFIFO();
  } else if (type_letter === 's') {
    return fstat.isSocket();
  }
  throw new RangeError("Invalid type argument: should be f, d, b, c, l, p, or s.");
}

// shouldn't be too hard to write Promise-returning wrapper functions
// for all the async calls in fs
/*
 * Returns a promise that is fulfilled on 'fs.readdir(dirname)'.
 */
function readdirPromise(dirname) {
  return new Promise(function(resolve, reject) {
    fs.readdir(dirname, function(err, filelist) {
      if (err) reject(err);
      resolve(filelist);
    })
  });
}

/**
 * Returns a promise that is fulfilled on 'fs.lstat(filename)'.
 */
function statPromise(filename) {
  return new Promise(function(resolve, reject) {
    // TODO: call state() or fstate() based on an argument
    fs.lstat(filename, function(err, fstat) {
      if (err) reject(err);
      resolve(fstat);
    })
  })
}

/**
 * prints disk contents to the console as directed by command-line arguments
 *
 */
function printContents(argv) {
  var dirname = argv._.toString();
  //console.log(`got dirname argument ${dirname}`);
  return readdirPromise(dirname)
    .then(function(dirlist) {
      for (var dir in dirlist) {
        let fname = dirname + "/" + dirlist[dir];
        statPromise(fname)
          .then(function(fstat) {
            var selected = false;
            if (argv.t != undefined) {
              selected = is_type_match(argv.t, fstat);
            }
            if (selected) {
              console.log(fname);
            }
            if (fstat.isDirectory()) {
              printContents(fname);
            }
          }, function(err) {
            console.error("ERROR getting status of " + fname + ": " + err);
          });
      }
    }, function(err) {
      console.error("ERROR reading directory " + dirname + ": " + err);
    })
}

printContents(argv);
