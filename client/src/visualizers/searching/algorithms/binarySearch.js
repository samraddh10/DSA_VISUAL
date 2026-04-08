import { STEP_TYPES } from '../../../engine/types.js'

export const binarySearchMeta = {
  id: 'binary-search',
  name: 'Binary Search',
  category: 'searching',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  bestCase: 'O(1)',
  worstCase: 'O(log n)',
  stable: true,
  description:
    'Efficiently finds a target in a sorted array by repeatedly halving the search interval.',
  code: {
    javascript: [
      'function binarySearch(arr, target) {',
      '  let low = 0;',
      '  let high = arr.length - 1;',
      '  while (low <= high) {',
      '    let mid = Math.floor((low + high) / 2);',
      '    if (arr[mid] === target) {',
      '      return mid;',
      '    } else if (arr[mid] < target) {',
      '      low = mid + 1;',
      '    } else {',
      '      high = mid - 1;',
      '    }',
      '  }',
      '  return -1;',
      '}',
    ],
    cpp: [
      'int binarySearch(vector<int>& arr, int target) {',
      '    int low = 0;',
      '    int high = arr.size() - 1;',
      '    while (low <= high) {',
      '        int mid = low + (high - low) / 2;',
      '        if (arr[mid] == target) {',
      '            return mid;',
      '        } else if (arr[mid] < target) {',
      '            low = mid + 1;',
      '        } else {',
      '            high = mid - 1;',
      '        }',
      '    }',
      '    return -1;',
      '}',
    ],
    c: [
      'int binarySearch(int arr[], int n, int target) {',
      '    int low = 0;',
      '    int high = n - 1;',
      '    while (low <= high) {',
      '        int mid = low + (high - low) / 2;',
      '        if (arr[mid] == target) {',
      '            return mid;',
      '        } else if (arr[mid] < target) {',
      '            low = mid + 1;',
      '        } else {',
      '            high = mid - 1;',
      '        }',
      '    }',
      '    return -1;',
      '}',
    ],
    python: [
      'def binary_search(arr, target):',
      '    low, high = 0, len(arr) - 1',
      '    while low <= high:',
      '        mid = (low + high) // 2',
      '        if arr[mid] == target:',
      '            return mid',
      '        elif arr[mid] < target:',
      '            low = mid + 1',
      '        else:',
      '            high = mid - 1',
      '    return -1',
    ],
    java: [
      'int binarySearch(int[] arr, int target) {',
      '    int low = 0;',
      '    int high = arr.length - 1;',
      '    while (low <= high) {',
      '        int mid = low + (high - low) / 2;',
      '        if (arr[mid] == target) {',
      '            return mid;',
      '        } else if (arr[mid] < target) {',
      '            low = mid + 1;',
      '        } else {',
      '            high = mid - 1;',
      '        }',
      '    }',
      '    return -1;',
      '}',
    ],
  },
}

export default function binarySearch(inputArr, target) {
  const arr = [...inputArr].sort((a, b) => a - b)
  const steps = []

  let low = 0
  let high = arr.length - 1

  steps.push({
    highlights: [],
    type: STEP_TYPES.SEARCH,
    codeLine: 0,
    description: `Starting binary search for ${target} in sorted array`,
    state: { array: arr, low, high, mid: -1, found: -1 },
  })

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)

    steps.push({
      highlights: [mid],
      type: STEP_TYPES.COMPARE,
      codeLine: 4,
      description: `Low=${low}, High=${high}, Mid=${mid} → arr[${mid}] = ${arr[mid]}`,
      state: { array: arr, low, high, mid, found: -1 },
    })

    if (arr[mid] === target) {
      steps.push({
        highlights: [mid],
        type: STEP_TYPES.FOUND,
        codeLine: 6,
        description: `Found ${target} at index ${mid}!`,
        state: { array: arr, low, high, mid, found: mid },
      })
      return steps
    } else if (arr[mid] < target) {
      steps.push({
        highlights: [mid],
        type: STEP_TYPES.SEARCH,
        codeLine: 8,
        description: `${arr[mid]} < ${target} → search right half, low = ${mid + 1}`,
        state: { array: arr, low: mid + 1, high, mid, found: -1 },
      })
      low = mid + 1
    } else {
      steps.push({
        highlights: [mid],
        type: STEP_TYPES.SEARCH,
        codeLine: 10,
        description: `${arr[mid]} > ${target} → search left half, high = ${mid - 1}`,
        state: { array: arr, low, high: mid - 1, mid, found: -1 },
      })
      high = mid - 1
    }
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 13,
    description: `Target ${target} not found in the array`,
    state: { array: arr, low, high, mid: -1, found: -1 },
  })

  return steps
}
