import { STEP_TYPES } from '../../../engine/types.js'

export const bubbleSortMeta = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  category: 'sorting',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
  bestCase: 'O(n)',
  worstCase: 'O(n²)',
  stable: true,
  description:
    'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
  code: {
    javascript: [
      'function bubbleSort(arr) {',
      '  for (let i = 0; i < arr.length - 1; i++) {',
      '    let swapped = false;',
      '    for (let j = 0; j < arr.length - 1 - i; j++) {',
      '      if (arr[j] > arr[j + 1]) {',
      '        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];',
      '        swapped = true;',
      '      }',
      '    }',
      '    if (!swapped) break;',
      '  }',
      '  return arr;',
      '}',
    ],
    cpp: [
      'void bubbleSort(vector<int>& arr) {',
      '    int n = arr.size();',
      '    for (int i = 0; i < n - 1; i++) {',
      '        bool swapped = false;',
      '        for (int j = 0; j < n - 1 - i; j++) {',
      '            if (arr[j] > arr[j + 1]) {',
      '                swap(arr[j], arr[j + 1]);',
      '                swapped = true;',
      '            }',
      '        }',
      '        if (!swapped) break;',
      '    }',
      '}',
    ],
    c: [
      'void bubbleSort(int arr[], int n) {',
      '    for (int i = 0; i < n - 1; i++) {',
      '        int swapped = 0;',
      '        for (int j = 0; j < n - 1 - i; j++) {',
      '            if (arr[j] > arr[j + 1]) {',
      '                int temp = arr[j];',
      '                arr[j] = arr[j + 1];',
      '                arr[j + 1] = temp;',
      '                swapped = 1;',
      '            }',
      '        }',
      '        if (!swapped) break;',
      '    }',
      '}',
    ],
    python: [
      'def bubble_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n - 1):',
      '        swapped = False',
      '        for j in range(n - 1 - i):',
      '            if arr[j] > arr[j + 1]:',
      '                arr[j], arr[j+1] = arr[j+1], arr[j]',
      '                swapped = True',
      '        if not swapped:',
      '            break',
      '    return arr',
    ],
    java: [
      'void bubbleSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int i = 0; i < n - 1; i++) {',
      '        boolean swapped = false;',
      '        for (int j = 0; j < n - 1 - i; j++) {',
      '            if (arr[j] > arr[j + 1]) {',
      '                int temp = arr[j];',
      '                arr[j] = arr[j + 1];',
      '                arr[j + 1] = temp;',
      '                swapped = true;',
      '            }',
      '        }',
      '        if (!swapped) break;',
      '    }',
      '}',
    ],
  },
}

export default function bubbleSort(inputArr) {
  const arr = [...inputArr]
  const steps = []
  const n = arr.length

  for (let i = 0; i < n - 1; i++) {
    let swapped = false
    for (let j = 0; j < n - 1 - i; j++) {
      steps.push({
        highlights: [j, j + 1],
        type: STEP_TYPES.COMPARE,
        codeLine: 4,
        description: `Comparing ${arr[j]} and ${arr[j + 1]}`,
        state: { array: [...arr], sorted: Array.from({ length: i }, (_, k) => n - 1 - k) },
      })

      if (arr[j] > arr[j + 1]) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swapped = true
        steps.push({
          highlights: [j, j + 1],
          swaps: [j, j + 1],
          type: STEP_TYPES.SWAP,
          codeLine: 5,
          description: `Swapping ${arr[j + 1]} and ${arr[j]}`,
          state: { array: [...arr], sorted: Array.from({ length: i }, (_, k) => n - 1 - k) },
        })
      }
    }
    if (!swapped) break
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 12,
    description: 'Array is sorted!',
    state: { array: [...arr], sorted: arr.map((_, i) => i) },
  })

  return steps
}
