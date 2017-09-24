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
    .usage(`Usage: $0 PATH [Search Option \u2026] [Selection|Action \u2026] [-h|--help]

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
        group: "Filters:",
        defaultDescription: "all types"
      },
      "m": {
        alias: "maxdepth",
        requiresArg: true,
        default: -1, // sentinel meaning "any depth"
        describe: "Descend at most LEVELS levels of directories below the " +
          "command line arguments.  --maxdepth 0 means only apply the tests and actions to " +
          "the command line arguments.",
        nargs: 1,
        type: "number",
        group: "Search Options:",
        defaultDescription: "no limit"
      },
      "p": {
        alias: "print",
        type: "boolean",
        default: true,
        describe: "print directory entry name to stdout. This is the"
          + " default action if no other is specified.",
        group: "Actions:"
      },
      "n": {
        alias: "name",
        type: "string",
        default: "*",
        requiresArg: true,
        nargs: 1,
        describe: "only select entries whose name matches PATTERN",
        group: "Filters:",
        defaultDescription: "all names"
      },
      "d": {
        alias: "depth",
        type: "boolean",
        default: false,
        group: "Search Options:",
        describe: "Process each directory's contents before the directory itself."
      },
      "debug": {
        type: "boolean",
        default: false,
        describe: "print lots of debug information"
      }
    })
    .help("h")
    .alias("h", "help")
    .version(function () {
      return require("../package").version
    })
    .epilog("\u00a9 2016 A. Lloyd Flanagan"
            + " (https://github.com/alflanagan/node_find)")
    .strict()
    .check((argv, aliases) => {
      let badargs = []
      if ((argv["maxdepth"] !== undefined && isNaN(argv["maxdepth"])) ||
           argv["maxdepth"] < -1) {
        throw new Error("Invalid value for maxdepth; must be"
                        + " non-negative integer")
      }
      return true;
    })
    .argv

//console.log(argv)
let searchSpace = new FilteredDirectoryTree(argv),
    selector = new SelectionSpec(argv),
    actions = new ActionSpec(argv)

searchSpace.process(selector, actions)

// Local Variables:
// indent-tabs-mode: nil
// tab-width: 2
// js-indent-level: 2
// End:
