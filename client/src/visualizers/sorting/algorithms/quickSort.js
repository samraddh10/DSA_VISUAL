import { STEP_TYPES } from '../../../engine/types.js'

export const quickSortMeta = {
  id: 'quick-sort',
  name: 'Quick Sort',
  category: 'sorting',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(log n)',
  bestCase: 'O(n log n)',
  worstCase: 'O(n²)',
  stable: false,
  description:
    'Picks a pivot, partitions the array around it, and recursively sorts the sub-arrays.',
  code: {
    javascript: [
      'function quickSort(arr, lo, hi) {',
      '  if (lo >= hi) return;',
      '  let pivot = arr[hi];',
      '  let i = lo;',
      '  for (let j = lo; j < hi; j++) {',
      '    if (arr[j] < pivot) {',
      '      [arr[i], arr[j]] = [arr[j], arr[i]];',
      '      i++;',
      '    }',
      '  }',
      '  [arr[i], arr[hi]] = [arr[hi], arr[i]];',
      '  quickSort(arr, lo, i - 1);',
      '  quickSort(arr, i + 1, hi);',
      '}',
    ],
    cpp: [
      'void quickSort(vector<int>& arr, int lo, int hi) {',
      '    if (lo >= hi) return;',
      '    int pivot = arr[hi];',
      '    int i = lo;',
      '    for (int j = lo; j < hi; j++) {',
      '        if (arr[j] < pivot) {',
      '            swap(arr[i], arr[j]);',
      '            i++;',
      '        }',
      '    }',
      '    swap(arr[i], arr[hi]);',
      '    quickSort(arr, lo, i - 1);',
      '    quickSort(arr, i + 1, hi);',
      '}',
    ],
    c: [
      'void quickSort(int arr[], int lo, int hi) {',
      '    if (lo >= hi) return;',
      '    int pivot = arr[hi];',
      '    int i = lo;',
      '    for (int j = lo; j < hi; j++) {',
      '        if (arr[j] < pivot) {',
      '            int temp = arr[i];',
      '            arr[i] = arr[j];',
      '            arr[j] = temp;',
      '            i++;',
      '        }',
      '    }',
      '    int temp = arr[i];',
      '    arr[i] = arr[hi];',
      '    arr[hi] = temp;',
      '    quickSort(arr, lo, i - 1);',
      '    quickSort(arr, i + 1, hi);',
      '}',
    ],
    python: [
      'def quick_sort(arr, lo, hi):',
      '    if lo >= hi:',
      '        return',
      '    pivot = arr[hi]',
      '    i = lo',
      '    for j in range(lo, hi):',
      '        if arr[j] < pivot:',
      '            arr[i], arr[j] = arr[j], arr[i]',
      '            i += 1',
      '    arr[i], arr[hi] = arr[hi], arr[i]',
      '    quick_sort(arr, lo, i - 1)',
      '    quick_sort(arr, i + 1, hi)',
    ],
    java: [
      'void quickSort(int[] arr, int lo, int hi) {',
      '    if (lo >= hi) return;',
      '    int pivot = arr[hi];',
      '    int i = lo;',
      '    for (int j = lo; j < hi; j++) {',
      '        if (arr[j] < pivot) {',
      '            int temp = arr[i];',
      '            arr[i] = arr[j];',
      '            arr[j] = temp;',
      '            i++;',
      '        }',
      '    }',
      '    int temp = arr[i];',
      '    arr[i] = arr[hi];',
      '    arr[hi] = temp;',
      '    quickSort(arr, lo, i - 1);',
      '    quickSort(arr, i + 1, hi);',
      '}',
    ],
  },
}

export default function quickSort(inputArr) {
  const arr = [...inputArr]
  const steps = []

  function qs(lo, hi) {
    if (lo >= hi) return

    const pivotVal = arr[hi]
    steps.push({
      highlights: [hi],
      type: STEP_TYPES.PIVOT,
      codeLine: 2,
      description: `Pivot = ${pivotVal} at index ${hi}`,
      state: { array: [...arr], pivot: hi },
    })

    let i = lo
    for (let j = lo; j < hi; j++) {
      steps.push({
        highlights: [j, hi],
        type: STEP_TYPES.COMPARE,
        codeLine: 5,
        description: `Comparing ${arr[j]} with pivot ${pivotVal}`,
        state: { array: [...arr], pivot: hi, partitionIndex: i },
      })

      if (arr[j] < pivotVal) {
        if (i !== j) {
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          steps.push({
            highlights: [i, j],
            swaps: [i, j],
            type: STEP_TYPES.SWAP,
            codeLine: 6,
            description: `Swapping ${arr[j]} and ${arr[i]}`,
            state: { array: [...arr], pivot: hi, partitionIndex: i },
          })
        }
        i++
      }
    }

    ;[arr[i], arr[hi]] = [arr[hi], arr[i]]
    steps.push({
      highlights: [i, hi],
      swaps: [i, hi],
      type: STEP_TYPES.SWAP,
      codeLine: 10,
      description: `Placing pivot ${pivotVal} at final position ${i}`,
      state: { array: [...arr] },
    })

    qs(lo, i - 1)
    qs(i + 1, hi)
  }

  qs(0, arr.length - 1)

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 13,
    description: 'Array is sorted!',
    state: { array: [...arr], sorted: arr.map((_, i) => i) },
  })

  return steps
}
