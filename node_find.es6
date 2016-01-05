"use strict";

var fs = require("fs");
//TODO: replace node asserts with userland assertion library
var assert = require("assert");
var path = require("path");

// shouldn't be too hard to write Promise-returning wrapper functions
// for all the async calls in fs
function readdirPromise(dirname) {
  return new Promise(function(resolve, reject) {
    fs.readdir(dirname, function(err, filelist) {
      if (err) reject(err);
      resolve(filelist);
    })
  });
}

function statPromise(filename) {
  return new Promise(function(resolve, reject) {
    fs.stat(filename, function(err, fstat) {
      if (err) reject(err);
      resolve(fstat);
    })
  })
}

function printContents(dirname) {
  return readdirPromise(dirname).then(function(dirlist) {
      for (var dir in dirlist) {
        let fname = dirname + "/" + dirlist[dir];
        statPromise(fname).then(
          function(fstat) {
            console.log(fname + (fstat.isDirectory() ? "/" : ""));
          },
          function(err) {
            console.error("ERROR getting status of " + fname + ": " + err);
          });
      }
    },
    function(err) {
      console.error("ERROR reading directory " + dirname + ": " + err);
    }
  )
}

if (process.argv.length < 3) {
  console.error("Usage: " + path.basename(__filename) + " path [expression]\n");
  // may allow default path for compatibility with UNIX find
  console.error("    path is required; default expression is -print");
  console.error("    expression may consist of: operators, options, tests, and actions:");
} else {
  printContents(process.argv[2]);
}
