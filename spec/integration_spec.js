/* test suite for integration tests */
/* global
   describe, it */

'use strict'

import { main } from '../node_find'

describe('The node_find executable', () => {
  describe('finds files', () => {
    it('prints a list', () => {
      const args = {
        _: ['spec/test_dir'],
        debug: false,
        type: 'f',
        t: 'f',
        m: -1,
        maxdepth: -1,
        n: '*',
        name: '*',
        f: false,
        follow: false,
        '$0': 'node_find'
      }
      main(args)
    })
  })
})
