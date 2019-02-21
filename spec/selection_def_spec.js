/** test suite for selection_def node module */
/* global
   describe, expect, it, beforeEach, afterEach */

'use strict'

import {
  SelectionDef // , isFileOfType
} from '../selection_def'

import fs from 'fs'
import mock from 'mock-fs'

describe('module selection_def', () => {
  describe('SelectionDef()', () => {
    describe('selects()', () => {
      beforeEach(() => {
        mock({
          'path/to/fake/dir': {
            'some-file.txt': 'file content here',
            'empty-dir': {
              /** empty directory */ }
          },
          'path/to/some.png': Buffer.from([8, 6, 7, 5, 3, 0, 9]),
          'some/other/path': {
            /** another empty directory */ }
        })
      })

      afterEach(() => {
        mock.restore()
      })

      it('selects a filespec whose name matches a pattern', () => {
        const sdef = new SelectionDef({ name: '*.png', type: 'f' })
        const stats = fs.statSync('path/to/some.png')
        const fspec = {
          name: 'path/to/some.png',
          stats: stats
        }
        expect(sdef.selects(fspec)).toBe(true)
      })

      it('does not select a filespec whose name does not match a pattern', () => {
        const sdef = new SelectionDef({ name: '*.png', type: 'f' })
        const stats = fs.statSync('path/to/fake/dir/some-file.txt')
        const fspec = {
          name: 'path/to/fake/dir/some-file.txt',
          stats: stats
        }
        expect(sdef.selects(fspec)).toBe(false)
      })
    })
  })
})
