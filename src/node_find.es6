/* @flow */
"use strict";

import "babel-polyfill";

var fs = require("fs");
//TODO: replace node asserts with userland assertion library
var assert = require("assert");
var path = require("path");

/**
 * An iterable tree of those directory entries which meet the criteria set by command-line arguments.
 *
 */
var FilteredDirectoryTree = (args) => {
  console.log(`path is ${args._}`);
  for (var key in args) {
    console.log(`args.${key} is ${args[key]}`);
  };
  return {};
}

var argv = require("yargs")
  .usage(`Usage: $0 path [--type filetype] [--maxdepth LEVELS] \n           [--name PATTERN] [-p] [-d]`)
  .command('path', 'A directory name (must exist)')
  .demand(1)
  .options({
    't': {
      alias: 'type',
      requiresArg: true,
      default: '*',
      describe: "type of directory entries to match",
      nargs: 1,
      type: 'string',
      choices: ['b', 'c', 'd', 'f', 'l', 'p', 's', '*']
    },
    'm': {
      alias: 'maxdepth',
      requiresArg: true,
      default: -1, // sentinel meaning 'any depth'
      describe: 'Descend at most LEVELS (a non-negative integer) levels of directories below the ' +
        'command line arguments.  -maxdepth 0 means only apply the tests and actions to ' +
        'the command line arguments.',
      nargs: 1,
      type: 'string'
    },
    'p': {
      alias: 'print',
      type: 'boolean',
      describe: 'print directory entry name to stdout (default)',

    },
    'n': {
      alias: 'name',
      type: 'string',
      default: '*',
      requiresArg: true,
      nargs: 1,
      describe: 'only select entries whose name matches PATTERN'
    }
  })
  .boolean('d')
  .alias('d', 'depth')
  .describe('d', "Process each directory's contents before the directory itself.")
  .help('h')
  .alias('h', 'help')
  .epilog('\u00a9 2016 A. Lloyd Flanagan (https://github.com/alflanagan/node_find)')
  .argv;

/**
 * Returns true if the Fstat strcture 'fstat' has the type selectecd by 'type_letter'.
 */
function is_type_match(type_letter, fstat) {
  //arg_require_in_set(type_letter, ['b', 'c', 'd', 'f', 'l']);
  // console.log(`is_type_match('${type_letter}', fstat)`);
  if (type_letter === '*') {
    // default
    return true;
  } else if (type_letter === 'f') {
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
  };
  throw new RangeError("Invalid type argument: should be f, d, b, c, l, p, or s.");
}

// shouldn't be too hard to write Promise-returning wrapper functions
// for all the async calls in fs
/*
 * Returns a promise that is fulfilled on 'fs.readdir(dirname)'.
 */
function readdirPromise(dirname) {
  return new Promise(function (resolve, reject) {
    fs.readdir(dirname, function (err, filelist) {
      if (err) reject(err);
      resolve(filelist);
    })
  });
}

/**
 * Returns a promise that is fulfilled on 'fs.lstat(filename)'.
 */
function statPromise(filename) {
  return new Promise(function (resolve, reject) {
    // TODO: call state() or fstate() based on an argument
    fs.lstat(filename, function (err, fstat) {
      if (err) reject(err);
      resolve(fstat);
    })
  })
}

/**
 * prints disk contents to the console as directed by command-line arguments
 *
 */
function printContents(dirname) {
  //console.log(`got dirname argument ${dirname}`);
  return readdirPromise(dirname)
    .then(function (dirlist) {
      try {
        // console.log(`readdirPromise arg is ${dirlist}`);
        for (var dir in dirlist) {
          let fname = `${dirname}/${dirlist[dir]}`;
          //console.log(`checking ${fname}.`);
          statPromise(fname)
            .then(function (fstat) {
              try {
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
              } catch (err) {
                console.error(`Exception raised in statPromise() call: ${err}`);
              }
            }, function (err) {
              console.error(`ERROR getting status of ${fname}: ${err}`);
            });
        }
      } catch (err) {
        console.error(`Exception raised in printContents(): ${err}`);
      }
    }, function (err) {
      console.error(`ERROR reading directory ${dirname}: ${err}`);
    })
}

var selectedEntries = new FilteredDirectoryTree(argv);

printContents(argv._.toString());
