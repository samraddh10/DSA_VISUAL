import { STEP_TYPES } from '../../../engine/types.js'

export const linearSearchMeta = {
  id: 'linear-search',
  name: 'Linear Search',
  category: 'searching',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  bestCase: 'O(1)',
  worstCase: 'O(n)',
  stable: true,
  description:
    'Sequentially checks each element of the list until the target is found or the list is exhausted.',
  code: {
    javascript: [
      'function linearSearch(arr, target) {',
      '  for (let i = 0; i < arr.length; i++) {',
      '    if (arr[i] === target) {',
      '      return i;',
      '    }',
      '  }',
      '  return -1;',
      '}',
    ],
    cpp: [
      'int linearSearch(vector<int>& arr, int target) {',
      '    for (int i = 0; i < arr.size(); i++) {',
      '        if (arr[i] == target) {',
      '            return i;',
      '        }',
      '    }',
      '    return -1;',
      '}',
    ],
    c: [
      'int linearSearch(int arr[], int n, int target) {',
      '    for (int i = 0; i < n; i++) {',
      '        if (arr[i] == target) {',
      '            return i;',
      '        }',
      '    }',
      '    return -1;',
      '}',
    ],
    python: [
      'def linear_search(arr, target):',
      '    for i in range(len(arr)):',
      '        if arr[i] == target:',
      '            return i',
      '    return -1',
    ],
    java: [
      'int linearSearch(int[] arr, int target) {',
      '    for (int i = 0; i < arr.length; i++) {',
      '        if (arr[i] == target) {',
      '            return i;',
      '        }',
      '    }',
      '    return -1;',
      '}',
    ],
  },
}

export default function linearSearch(inputArr, target) {
  const arr = [...inputArr]
  const steps = []

  steps.push({
    highlights: [],
    type: STEP_TYPES.SEARCH,
    codeLine: 0,
    description: `Starting linear search for target ${target}`,
    state: { array: arr, current: -1, found: -1 },
  })

  for (let i = 0; i < arr.length; i++) {
    steps.push({
      highlights: [i],
      type: STEP_TYPES.COMPARE,
      codeLine: 2,
      description: `Checking index ${i}: is ${arr[i]} === ${target}?`,
      state: { array: arr, current: i, found: -1 },
    })

    if (arr[i] === target) {
      steps.push({
        highlights: [i],
        type: STEP_TYPES.FOUND,
        codeLine: 3,
        description: `Found ${target} at index ${i}!`,
        state: { array: arr, current: i, found: i },
      })
      return steps
    }
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 6,
    description: `Target ${target} not found in the array`,
    state: { array: arr, current: -1, found: -1 },
  })

  return steps
}
