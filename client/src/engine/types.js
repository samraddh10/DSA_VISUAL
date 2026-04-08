/**
 * AnimationStep shape — every algorithm returns an array of these.
 *
 * @typedef {Object} AnimationStep
 * @property {number[]}          highlights   - Indices or node IDs to highlight
 * @property {[number, number]=} swaps        - Pair of indices being swapped (sorting)
 * @property {number}            codeLine     - Line to highlight in the code viewer
 * @property {string}            description  - Human-readable step description
 * @property {Record<string, *>} state        - Snapshot of the data structure at this step
 * @property {string=}           type         - Step category: 'compare' | 'swap' | 'set' | 'done' | 'pivot' | 'merge'
 */

/**
 * AlgorithmMeta — metadata about an algorithm.
 *
 * @typedef {Object} AlgorithmMeta
 * @property {string}   id          - Unique identifier
 * @property {string}   name        - Display name
 * @property {string}   category    - 'sorting' | 'searching' | 'tree' | 'graph' | 'dp'
 * @property {string}   timeComplexity  - e.g. "O(n²)"
 * @property {string}   spaceComplexity - e.g. "O(1)"
 * @property {string}   bestCase    - Best case time
 * @property {string}   worstCase   - Worst case time
 * @property {string}   description - Brief explanation
 * @property {boolean}  stable      - Whether the sort is stable
 * @property {string[]} code        - Lines of pseudocode
 */

export const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 1.5, 2, 4]

export const DEFAULT_SPEED = 1

export const STEP_TYPES = {
  COMPARE: 'compare',
  SWAP: 'swap',
  SET: 'set',
  DONE: 'done',
  PIVOT: 'pivot',
  MERGE: 'merge',
  SEARCH: 'search',
  FOUND: 'found',
  INSERT: 'insert',
  DELETE: 'delete',
  VISIT: 'visit',
}
