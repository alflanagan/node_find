/* @flow */
/* note above more a declaration of intent than actual use, so far */
"use strict";

/** @module node_find */
/**
 * Implements a "find" command using node.
 * @license GPL-3
 */

import "babel-polyfill";
import fs from "fs";
import FilteredDirectoryTree from "./filtered_dir_tree";
import {
  statPromise,
  readdirPromise
} from "./fs_promise";

var argv = require("yargs")
  .usage(`Usage: $0 path [selection-options] [action-options] [-h|--help]

    selection-options:
        [-t|--type letter] [-m|--maxdepth number] [-d|--depth] [-n|--name PATTERN]

    action-options:
        [-p|--print]
  `)
  .command('path', 'A directory name (must exist)')
  .demand(1)
  // note output formatting is clumsy. Will probably have to customize.
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
    },
    'd': {
      alias: 'depth',
      type: 'boolean',
      describe: "Process each directory's contents before the directory itself.",
    }
  })
  .help('h')
  .alias('h', 'help')
  .version(function () {
    return require('../package').version;
  })
  .epilog('\u00a9 2016 A. Lloyd Flanagan (https://github.com/alflanagan/node_find)')
  .argv;

/**
 * Guided by parameters in args, performs the selected actions against directory entries in selected.
 *
 * @param {Object} selected - An instance of filtered_dir_tree selecting a set of directory entries.
 *
 * @param {Object} argv - An instance of a yargs call containing action arguments.
 *
 */
function perform_actions(selected, args) {
  try {
    console.log('perform_actions()');
  } catch (err) {
    console.error(`Exception raised in perform_actions(): ${err}`);
  }
  for (fname in selected.iterator()) {
    if (args.p) {
      console.log(fname);
    }
  }
}

var selectedEntries = new FilteredDirectoryTree(argv);

readdirPromise('.')
  .then(function (flist) {
    flist.forEach(function (fname) {
      console.log(fname);
    });
  }, function (reason) {
    console.log(`Promise was rejected: ${reason}`);
  });

statPromise('.')
  .then(function (fstats) {
      console.log(fstats);
    },
    function (err) {
      console.error(`Error in statPromise(): ${err}`)
    });

perform_actions(selectedEntries, argv);
