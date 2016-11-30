/** test suite for filtered_dir_tree node module */
/* global
   describe, expect, it */

"use strict"

import "babel-polyfill"
import {
  FilteredDirectoryTree
} from "../build/filtered_dir_tree"

const make_args = function(args) {
  let allargs = {"_": ".",
		 "p": false,
		 "print": false,
		 "d": false,
		 "depth": false,
		 "h": false,
		 "help": false,
		 "version": false,
		 "t": "*",
		 "type": "*",
		 "m": -1,
		 "maxdepth": -1,
		 "n": "*",
		 "name": "*",
		 "$0": "build/node_find.js"
		}
  for (let key in args) {
    allargs[key] = args[key]
  }
  return allargs;
}

describe("test search by type", function () {
  it("should just work", function () {
    let args = make_args({
      p: true,
      path: ".",
      maxDepth: -1,
      name: "*",
      n: "*",
      depth: false,
      type: "f"
    })

    let fdtree = new FilteredDirectoryTree(args)

    for (var fname in fdtree) {
      expect(typeof fname).toBe("string")
    }
  })
}) // describe()
