import { STEP_TYPES } from '../../../engine/types.js'

export const insertionSortMeta = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  category: 'sorting',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
  bestCase: 'O(n)',
  worstCase: 'O(n²)',
  stable: true,
  description:
    'Builds the sorted array one item at a time by inserting each element into its correct position.',
  code: {
    javascript: [
      'function insertionSort(arr) {',
      '  for (let i = 1; i < arr.length; i++) {',
      '    let key = arr[i];',
      '    let j = i - 1;',
      '    while (j >= 0 && arr[j] > key) {',
      '      arr[j + 1] = arr[j];',
      '      j--;',
      '    }',
      '    arr[j + 1] = key;',
      '  }',
      '  return arr;',
      '}',
    ],
    cpp: [
      'void insertionSort(vector<int>& arr) {',
      '    int n = arr.size();',
      '    for (int i = 1; i < n; i++) {',
      '        int key = arr[i];',
      '        int j = i - 1;',
      '        while (j >= 0 && arr[j] > key) {',
      '            arr[j + 1] = arr[j];',
      '            j--;',
      '        }',
      '        arr[j + 1] = key;',
      '    }',
      '}',
    ],
    c: [
      'void insertionSort(int arr[], int n) {',
      '    for (int i = 1; i < n; i++) {',
      '        int key = arr[i];',
      '        int j = i - 1;',
      '        while (j >= 0 && arr[j] > key) {',
      '            arr[j + 1] = arr[j];',
      '            j--;',
      '        }',
      '        arr[j + 1] = key;',
      '    }',
      '}',
    ],
    python: [
      'def insertion_sort(arr):',
      '    for i in range(1, len(arr)):',
      '        key = arr[i]',
      '        j = i - 1',
      '        while j >= 0 and arr[j] > key:',
      '            arr[j + 1] = arr[j]',
      '            j -= 1',
      '        arr[j + 1] = key',
      '    return arr',
    ],
    java: [
      'void insertionSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int i = 1; i < n; i++) {',
      '        int key = arr[i];',
      '        int j = i - 1;',
      '        while (j >= 0 && arr[j] > key) {',
      '            arr[j + 1] = arr[j];',
      '            j--;',
      '        }',
      '        arr[j + 1] = key;',
      '    }',
      '}',
    ],
  },
}

export default function insertionSort(inputArr) {
  const arr = [...inputArr]
  const steps = []
  const n = arr.length

  for (let i = 1; i < n; i++) {
    const key = arr[i]
    let j = i - 1

    steps.push({
      highlights: [i],
      type: STEP_TYPES.SET,
      codeLine: 2,
      description: `Key = ${key}, inserting into sorted portion`,
      state: { array: [...arr], sorted: Array.from({ length: i }, (_, k) => k) },
    })

    while (j >= 0 && arr[j] > key) {
      steps.push({
        highlights: [j, j + 1],
        type: STEP_TYPES.COMPARE,
        codeLine: 4,
        description: `${arr[j]} > ${key}, shifting right`,
        state: { array: [...arr], sorted: Array.from({ length: i }, (_, k) => k) },
      })

      arr[j + 1] = arr[j]
      j--

      steps.push({
        highlights: [j + 1, j + 2],
        swaps: [j + 1, j + 2],
        type: STEP_TYPES.SWAP,
        codeLine: 5,
        description: `Shifted element to index ${j + 2}`,
        state: { array: [...arr], sorted: Array.from({ length: i }, (_, k) => k) },
      })
    }

    arr[j + 1] = key
    steps.push({
      highlights: [j + 1],
      type: STEP_TYPES.SET,
      codeLine: 8,
      description: `Placed ${key} at index ${j + 1}`,
      state: { array: [...arr], sorted: Array.from({ length: i + 1 }, (_, k) => k) },
    })
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 11,
    description: 'Array is sorted!',
    state: { array: [...arr], sorted: arr.map((_, i) => i) },
  })

  return steps
}
