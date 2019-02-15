/** @module useful */
/**
 * Useful more-or-less general-purpose functions.
 *
 * @license GPL-3
 * @author A. Lloyd Flanagan
 * @copyright 2019
 *
 */

import R from 'ramda'
import micromatch from 'micromatch'
import { basename } from 'path'

/**
 * Returns a new object whose key/value pairs are the set of pairs in `source` for which the key is in
 * `keySet`.
 *
 * @param {Set<String>} keySet
 * @param {Object} source
 */
export function filterKeys (keySet, source) {
  const dest = {}
  for (let key of R.keys(source)) {
    if (keySet.has(key)) {
      dest[key] = source[key]
    }
  }
  return dest
}

/**
 * Does the filename of the directory entry in `fspec` match a pattern?
 *
 * @param {string} pattern A pattern expression compatible with micromatch (https://github.com/micromatch/micromatch)
 * @param {Object} fspec Single directory entry specification (@see
 *                       FilteredDirectoryTree.iterator)
 */
export function pathMatches (pattern, fspec) {
  if (pattern === '*') return true // optimization
  const theMatch = micromatch.match(basename(fspec.name), pattern)
  return R.not(R.isEmpty(theMatch))
}
