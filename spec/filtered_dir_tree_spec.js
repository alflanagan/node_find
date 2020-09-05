/** test suite for filtered_dir_tree node module */
/* global
   describe, expect, it */

'use strict'

import { FilteredDirectoryTree } from '../filtered_dir_tree'

/**
 * Helper function to create arguments object, with default values for tests.
 *
 * @param {Object} args Argument values that differ from defaults.
 */
const makeArgs = function (args) {
  const allargs = {
    _: '.',
    p: false,
    print: false,
    d: false,
    depth: false,
    h: false,
    help: false,
    version: false,
    t: '*',
    type: '*',
    m: -1,
    maxdepth: -1,
    n: '*',
    name: '*',
    $0: 'build/node_find.js'
  }
  for (const key in args) {
    allargs[key] = args[key]
  }
  return allargs
}

describe('test search by type', function () {
  it('should just work', function () {
    const args = makeArgs({
      p: true,
      maxDepth: -1,
      name: '*',
      n: '*',
      type: 'f'
    })

    const fdtree = new FilteredDirectoryTree(args)

    for (var fname in fdtree) {
      expect(typeof fname).toBe('string')
    }
  })
}) // describe()

// for emacs:
// Local Variables:
// indent-tabs-mode: nil
// js2-strict-missing-semi-warning: nil
// js-indent-level: 2
// End:
