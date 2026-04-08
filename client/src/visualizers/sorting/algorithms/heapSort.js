import { STEP_TYPES } from '../../../engine/types.js'

export const heapSortMeta = {
  id: 'heap-sort',
  name: 'Heap Sort',
  category: 'sorting',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(1)',
  bestCase: 'O(n log n)',
  worstCase: 'O(n log n)',
  stable: false,
  description:
    'Builds a max-heap from the array, then repeatedly extracts the maximum to sort.',
  code: {
    javascript: [
      'function heapSort(arr) {',
      '  let n = arr.length;',
      '  // Build max heap',
      '  for (let i = Math.floor(n/2) - 1; i >= 0; i--)',
      '    heapify(arr, n, i);',
      '  // Extract elements',
      '  for (let i = n - 1; i > 0; i--) {',
      '    [arr[0], arr[i]] = [arr[i], arr[0]];',
      '    heapify(arr, i, 0);',
      '  }',
      '}',
      '',
      'function heapify(arr, n, i) {',
      '  let largest = i;',
      '  let l = 2*i + 1, r = 2*i + 2;',
      '  if (l < n && arr[l] > arr[largest]) largest = l;',
      '  if (r < n && arr[r] > arr[largest]) largest = r;',
      '  if (largest !== i) {',
      '    [arr[i], arr[largest]] = [arr[largest], arr[i]];',
      '    heapify(arr, n, largest);',
      '  }',
      '}',
    ],
    cpp: [
      'void heapify(vector<int>& arr, int n, int i) {',
      '    int largest = i;',
      '    int l = 2*i + 1, r = 2*i + 2;',
      '    if (l < n && arr[l] > arr[largest]) largest = l;',
      '    if (r < n && arr[r] > arr[largest]) largest = r;',
      '    if (largest != i) {',
      '        swap(arr[i], arr[largest]);',
      '        heapify(arr, n, largest);',
      '    }',
      '}',
      '',
      'void heapSort(vector<int>& arr) {',
      '    int n = arr.size();',
      '    for (int i = n/2 - 1; i >= 0; i--)',
      '        heapify(arr, n, i);',
      '    for (int i = n - 1; i > 0; i--) {',
      '        swap(arr[0], arr[i]);',
      '        heapify(arr, i, 0);',
      '    }',
      '}',
    ],
    c: [
      'void heapify(int arr[], int n, int i) {',
      '    int largest = i;',
      '    int l = 2*i + 1, r = 2*i + 2;',
      '    if (l < n && arr[l] > arr[largest]) largest = l;',
      '    if (r < n && arr[r] > arr[largest]) largest = r;',
      '    if (largest != i) {',
      '        int temp = arr[i];',
      '        arr[i] = arr[largest];',
      '        arr[largest] = temp;',
      '        heapify(arr, n, largest);',
      '    }',
      '}',
      '',
      'void heapSort(int arr[], int n) {',
      '    for (int i = n/2 - 1; i >= 0; i--)',
      '        heapify(arr, n, i);',
      '    for (int i = n - 1; i > 0; i--) {',
      '        int temp = arr[0];',
      '        arr[0] = arr[i];',
      '        arr[i] = temp;',
      '        heapify(arr, i, 0);',
      '    }',
      '}',
    ],
    python: [
      'def heapify(arr, n, i):',
      '    largest = i',
      '    l, r = 2*i + 1, 2*i + 2',
      '    if l < n and arr[l] > arr[largest]:',
      '        largest = l',
      '    if r < n and arr[r] > arr[largest]:',
      '        largest = r',
      '    if largest != i:',
      '        arr[i], arr[largest] = arr[largest], arr[i]',
      '        heapify(arr, n, largest)',
      '',
      'def heap_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n // 2 - 1, -1, -1):',
      '        heapify(arr, n, i)',
      '    for i in range(n - 1, 0, -1):',
      '        arr[0], arr[i] = arr[i], arr[0]',
      '        heapify(arr, i, 0)',
    ],
    java: [
      'void heapify(int[] arr, int n, int i) {',
      '    int largest = i;',
      '    int l = 2*i + 1, r = 2*i + 2;',
      '    if (l < n && arr[l] > arr[largest]) largest = l;',
      '    if (r < n && arr[r] > arr[largest]) largest = r;',
      '    if (largest != i) {',
      '        int temp = arr[i];',
      '        arr[i] = arr[largest];',
      '        arr[largest] = temp;',
      '        heapify(arr, n, largest);',
      '    }',
      '}',
      '',
      'void heapSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int i = n/2 - 1; i >= 0; i--)',
      '        heapify(arr, n, i);',
      '    for (int i = n - 1; i > 0; i--) {',
      '        int temp = arr[0];',
      '        arr[0] = arr[i];',
      '        arr[i] = temp;',
      '        heapify(arr, i, 0);',
      '    }',
      '}',
    ],
  },
}

export default function heapSort(inputArr) {
  const arr = [...inputArr]
  const steps = []
  const n = arr.length

  function heapify(size, i) {
    let largest = i
    const l = 2 * i + 1
    const r = 2 * i + 2

    if (l < size) {
      steps.push({
        highlights: [l, largest],
        type: STEP_TYPES.COMPARE,
        codeLine: 15,
        description: `Comparing left child ${arr[l]} with ${arr[largest]}`,
        state: { array: [...arr] },
      })
      if (arr[l] > arr[largest]) largest = l
    }

    if (r < size) {
      steps.push({
        highlights: [r, largest],
        type: STEP_TYPES.COMPARE,
        codeLine: 16,
        description: `Comparing right child ${arr[r]} with ${arr[largest]}`,
        state: { array: [...arr] },
      })
      if (arr[r] > arr[largest]) largest = r
    }

    if (largest !== i) {
      ;[arr[i], arr[largest]] = [arr[largest], arr[i]]
      steps.push({
        highlights: [i, largest],
        swaps: [i, largest],
        type: STEP_TYPES.SWAP,
        codeLine: 18,
        description: `Swapping ${arr[largest]} and ${arr[i]}`,
        state: { array: [...arr] },
      })
      heapify(size, largest)
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i)
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.SET,
    codeLine: 4,
    description: 'Max heap built!',
    state: { array: [...arr] },
  })

  // Extract from heap
  for (let i = n - 1; i > 0; i--) {
    ;[arr[0], arr[i]] = [arr[i], arr[0]]
    steps.push({
      highlights: [0, i],
      swaps: [0, i],
      type: STEP_TYPES.SWAP,
      codeLine: 7,
      description: `Moving max ${arr[i]} to position ${i}`,
      state: { array: [...arr], sorted: Array.from({ length: n - i }, (_, k) => n - 1 - k) },
    })
    heapify(i, 0)
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 10,
    description: 'Array is sorted!',
    state: { array: [...arr], sorted: arr.map((_, i) => i) },
  })

  return steps
}
