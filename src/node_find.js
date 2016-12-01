/** @module node_find */
/**
 * Implements a "find" command using node.
 * @license GPL-3
 */

const FilteredDirectoryTree = require("./filtered_dir_tree")

const fs_promise = require("./fs_promise")
const statPromise = fs_promise.statPromise
const readdirPromise = fs_promise.readdirPromise
const SelectionSpec = require("./selection_spec")
const ActionSpec = require("./action_spec")

var argv = require("yargs")
  .usage(`Usage: $0 <path> [Selections] [Actions] [-h|--help]

path: A file or directory path.
  `)
  .demand(1)
  .options({
    "t": {
      alias: "type",
      requiresArg: true,
      default: "*",
      describe: "type of directory entries to match",
      nargs: 1,
      type: "string",
      choices: ["b", "c", "d", "f", "l", "p", "s", "*"],
      group: "Selections"
    },
    "m": {
      alias: "maxdepth",
      requiresArg: true,
      default: -1, // sentinel meaning "any depth"
      describe: "Descend at most LEVELS (a non-negative integer) levels of directories below the " +
        "command line arguments.  -maxdepth 0 means only apply the tests and actions to " +
        "the command line arguments.",
      nargs: 1,
      type: "string",
      group: "Selections"
    },
    "p": {
      alias: "print",
      type: "boolean",
      describe: "print directory entry name to stdout (default)",
      group: "Actions"
    },
    "n": {
      alias: "name",
      type: "string",
      default: "*",
      requiresArg: true,
      nargs: 1,
      describe: "only select entries whose name matches PATTERN",
      group: "Selections"
    },
    "d": {
      alias: "depth",
      type: "boolean",
      describe: "Process each directory's contents before the directory itself.",
      group: "Actions"
    }
  })
  .help("h")
  .alias("h", "help")
  .version(function () {
    return require("../package").version
  })
  .epilog("\u00a9 2016 A. Lloyd Flanagan (https://github.com/alflanagan/node_find)")
  .argv


let searchSpace = new FilteredDirectoryTree(argv),
    selector = new SelectionSpec(argv),
    actions = new ActionSpec(argv)

for (let file_spec in searchSpace) {
  if (selector.selects(file_spec)) {
    actions.run(file_spec)
  }
}
