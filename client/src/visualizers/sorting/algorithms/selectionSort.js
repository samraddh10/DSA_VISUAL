import { STEP_TYPES } from '../../../engine/types.js'

export const selectionSortMeta = {
  id: 'selection-sort',
  name: 'Selection Sort',
  category: 'sorting',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
  bestCase: 'O(n²)',
  worstCase: 'O(n²)',
  stable: false,
  description:
    'Finds the minimum element from the unsorted part and places it at the beginning.',
  code: {
    javascript: [
      'function selectionSort(arr) {',
      '  for (let i = 0; i < arr.length - 1; i++) {',
      '    let minIdx = i;',
      '    for (let j = i + 1; j < arr.length; j++) {',
      '      if (arr[j] < arr[minIdx]) {',
      '        minIdx = j;',
      '      }',
      '    }',
      '    if (minIdx !== i) {',
      '      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];',
      '    }',
      '  }',
      '  return arr;',
      '}',
    ],
    cpp: [
      'void selectionSort(vector<int>& arr) {',
      '    int n = arr.size();',
      '    for (int i = 0; i < n - 1; i++) {',
      '        int minIdx = i;',
      '        for (int j = i + 1; j < n; j++) {',
      '            if (arr[j] < arr[minIdx]) {',
      '                minIdx = j;',
      '            }',
      '        }',
      '        if (minIdx != i) {',
      '            swap(arr[i], arr[minIdx]);',
      '        }',
      '    }',
      '}',
    ],
    c: [
      'void selectionSort(int arr[], int n) {',
      '    for (int i = 0; i < n - 1; i++) {',
      '        int minIdx = i;',
      '        for (int j = i + 1; j < n; j++) {',
      '            if (arr[j] < arr[minIdx]) {',
      '                minIdx = j;',
      '            }',
      '        }',
      '        if (minIdx != i) {',
      '            int temp = arr[i];',
      '            arr[i] = arr[minIdx];',
      '            arr[minIdx] = temp;',
      '        }',
      '    }',
      '}',
    ],
    python: [
      'def selection_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n - 1):',
      '        min_idx = i',
      '        for j in range(i + 1, n):',
      '            if arr[j] < arr[min_idx]:',
      '                min_idx = j',
      '        if min_idx != i:',
      '            arr[i], arr[min_idx] = arr[min_idx], arr[i]',
      '    return arr',
    ],
    java: [
      'void selectionSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int i = 0; i < n - 1; i++) {',
      '        int minIdx = i;',
      '        for (int j = i + 1; j < n; j++) {',
      '            if (arr[j] < arr[minIdx]) {',
      '                minIdx = j;',
      '            }',
      '        }',
      '        if (minIdx != i) {',
      '            int temp = arr[i];',
      '            arr[i] = arr[minIdx];',
      '            arr[minIdx] = temp;',
      '        }',
      '    }',
      '}',
    ],
  },
}

export default function selectionSort(inputArr) {
  const arr = [...inputArr]
  const steps = []
  const n = arr.length

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i

    for (let j = i + 1; j < n; j++) {
      steps.push({
        highlights: [j, minIdx],
        type: STEP_TYPES.COMPARE,
        codeLine: 4,
        description: `Comparing ${arr[j]} with current min ${arr[minIdx]}`,
        state: { array: [...arr], sorted: Array.from({ length: i }, (_, k) => k), minIdx },
      })

      if (arr[j] < arr[minIdx]) {
        minIdx = j
        steps.push({
          highlights: [minIdx],
          type: STEP_TYPES.SET,
          codeLine: 5,
          description: `New minimum found: ${arr[minIdx]} at index ${minIdx}`,
          state: { array: [...arr], sorted: Array.from({ length: i }, (_, k) => k), minIdx },
        })
      }
    }

    if (minIdx !== i) {
      ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
      steps.push({
        highlights: [i, minIdx],
        swaps: [i, minIdx],
        type: STEP_TYPES.SWAP,
        codeLine: 9,
        description: `Swapping ${arr[minIdx]} and ${arr[i]}`,
        state: { array: [...arr], sorted: Array.from({ length: i + 1 }, (_, k) => k) },
      })
    }
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 13,
    description: 'Array is sorted!',
    state: { array: [...arr], sorted: arr.map((_, i) => i) },
  })

  return steps
}
