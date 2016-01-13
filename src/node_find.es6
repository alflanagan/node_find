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
  .usage("Usage: " + path.basename(__filename) + " path [expression]\n" + "    path is required; default expression is -print\n" + "    expression may consist of: operators, options, tests, and actions:")
  .help('h')
  .alias('h', 'help')
  .argv;

/**
 *
 */
function arg_require_in_set(value, iterable_of_required, message) {
  console.log(`arg_require_in_set(${value}, [${iterable_of_required}])`);

  if (message === undefined) {
    message = "Argument must be one of [";
    var first = true;
    for (var x in iterable_of_required) {
      message += first ? `${x}` : `, ${x}`;
      first = false;
    }
    message += "]";
  }

  for (reqd in iterable_of_required) {
    if (value === reqd) {
      return;
    }
  }
  throw new RangeError(message);
}

function is_type_match(type_letter, fstat) {
  arg_require_in_set(type_letter, ['b', 'c', 'd', 'f', 'l']);
  return true;
}

// shouldn't be too hard to write Promise-returning wrapper functions
// for all the async calls in fs
function readdirPromise(dirname) {
  return new Promise(function (resolve, reject) {
    fs.readdir(dirname, function (err, filelist) {
      if (err) reject(err);
      resolve(filelist);
    })
  });
}

function statPromise(filename) {
  return new Promise(function (resolve, reject) {
    fs.stat(filename, function (err, fstat) {
      if (err) reject(err);
      resolve(fstat);
    })
  })
}

function printContents(argv) {
  var dirname = argv._.toString();
  //console.log(`got dirname argument ${dirname}`);
  return readdirPromise(dirname)
    .then(function (dirlist) {
      for (var dir in dirlist) {
        let fname = dirname + "/" + dirlist[dir];
        statPromise(fname)
          .then(function (fstat) {
            var selected = false;
            if (argv.t != undefined) {
              selected = is_type_match(argv.t, fstat);
            }
            if (fstat.isDirectory()) {
              printContents(fname);
            } else {
              if (selected) {
                console.log(fname);
              }
            }
          }, function (err) {
            console.error("ERROR getting status of " + fname + ": " + err);
          });
      }
    }, function (err) {
      console.error("ERROR reading directory " + dirname + ": " + err);
    })
}

printContents(argv);
