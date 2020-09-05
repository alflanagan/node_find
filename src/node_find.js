/** @module node_find */
/**
 * Implements a 'find' command using node.
 * @license GPL-3
 */

import { Action } from './action'
import { FilteredDirectoryTree } from './filtered_dir_tree'
import { SelectionDef } from './selection_def'

const thisYear = () => {
  const today = new Date()
  return today.getFullYear()
}

const argv = require('yargs')
const COPY = '\u00a9'
const HELLIP = '\u2026' // horiz. ellipsis

argv.usage(`Usage: $0 <path> [Search Option ${HELLIP}] [Selection|Action ${HELLIP}] [-h|--help]

path: A file or directory path.
`) // .demand(1)
  .demandCommand(1, 'You must provide a <path> argument')
  .options({
    t: {
      alias: 'type',
      requiresArg: true,
      default: '*',
      describe: 'type of directory entries to match',
      nargs: 1,
      type: 'string',
      choices: ['b', 'c', 'd', 'f', 'l', 'p', 's', '*'],
      group: 'Filters:',
      defaultDescription: 'all types'
    },
    m: {
      alias: 'maxdepth',
      requiresArg: true,
      describe: 'Descend at most LEVELS directory levels below the given PATH' +
        '\n--maxdepth 0 means only apply the tests and actions to ' +
        'PATH itself.',
      nargs: 1,
      type: 'number',
      default: -1,
      group: 'Search Options:',
      defaultDescription: 'no limit'
    },
    p: {
      alias: 'print',
      type: 'boolean',
      default: false,
      describe: 'print directory entry name to stdout. This is the' +
      ' default action if no other is specified.',
      group: 'Actions:'
    },
    n: {
      alias: 'name',
      type: 'string',
      default: '*',
      requiresArg: true,
      nargs: 1,
      describe: 'only select entries whose name matches PATTERN',
      group: 'Filters:',
      defaultDescription: 'all names'
    },
    // 'd': {
    //   alias: 'depth',
    //   type: 'boolean',
    //   default: false,
    //   group: 'Search Options:',
    //   describe: "Process each directory's contents before the directory itself."
    // },
    f: {
      alias: 'follow',
      type: 'bool',
      default: false,
      requiresArg: false,
      describe: 'follow symbolic links',
      group: 'Search Options:'

    },
    debug: {
      type: 'boolean',
      default: false,
      describe: 'print lots of debug information'
    }
  })
  .help('h')
  .alias('h', 'help')
  .version(require('../package').version)
  .epilog(`${COPY} ${thisYear()} A. Lloyd Flanagan (https://github.com/alflanagan/node_find)`)
  .strict()
  .check((argv, aliases) => {
    if ((argv.maxdepth !== -1 && argv.maxdepth < 0) || isNaN(argv.maxdepth)) {
      throw new Error('Invalid value for --maxdepth; must be non-negative integer')
    }
    return true
  })

const args = argv.argv

const searchSpace = new FilteredDirectoryTree(args)
const selector = new SelectionDef(args)
const actions = new Action(args)

searchSpace.process(selector, actions)

// Local Variables:
// indent-tabs-mode: nil
// tab-width: 2
// js-indent-level: 2
// End:
