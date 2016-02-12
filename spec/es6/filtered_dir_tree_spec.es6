/** test suite for filtered_dir_tree node module */
"use strict";

import "babel-polyfill";
import {FilteredDirectoryTree} from "../build/filtered_dir_tree";

describe("test search by type", function () {
  it("should just work", function() {
    let args = {
      p: true,
      path: '.',
      maxDepth: -1,
      name: '*',
      n: '*',
      depth: false,
      type: 'f'
    }
    let fdtree = new FilteredDirectoryTree(args);

    let iter = fdtree.iterator();

    expect(iter.next).toBeDefined();
    var first = iter.next();
    console.log(first);
    for (var fname in iter) {
      console.log(fname);
      expect(typeof fname).toBe("string");
   }
  });
}); // describe()