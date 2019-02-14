/** test suite for selection_def node module */
/* global
   describe, expect, it */

'use strict'

import {
  SelectionDef
} from '../selection_def'

describe('module selection_def', () => {
  describe('SelectionDef()', () => {
    describe('the constructor', () => {
      it('sets configuration from args or defaults', () => {
        const newDef = new SelectionDef()
        expect(newDef.conf).toBeDefined()
        expect(newDef.conf).toEqual({
          name: '*',
          debug: false
        })
        const otherDef = new SelectionDef({
          type: 'f',
          name: '*.js',
          debug: true
        })
        expect(otherDef.conf).toEqual({
          name: '*.js',
          debug: true,
          type: 'f'
        })
      })

      it('ignores irrelevant keys in arguments', () => {
        const newDef = new SelectionDef({ fred: 'wilma', barney: 'betty' })
        expect(newDef.conf).toBeDefined()
        expect(newDef.conf).toEqual({
          name: '*',
          debug: false
        })
        const otherDef = new SelectionDef({
          type: 'f',
          name: '*.js',
          debug: true,
          because: 'why not',
          for: 'the lulz'
        })
        expect(otherDef.conf).toEqual({
          name: '*.js',
          debug: true,
          type: 'f'
        })
      })
    })
  })
})
