import { STEP_TYPES } from '../../../engine/types.js'

export const mergeSortMeta = {
  id: 'merge-sort',
  name: 'Merge Sort',
  category: 'sorting',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  bestCase: 'O(n log n)',
  worstCase: 'O(n log n)',
  stable: true,
  description:
    'Divides the array in half, recursively sorts each half, then merges the sorted halves.',
  code: {
    javascript: [
      'function mergeSort(arr, l, r) {',
      '  if (l >= r) return;',
      '  let mid = Math.floor((l + r) / 2);',
      '  mergeSort(arr, l, mid);',
      '  mergeSort(arr, mid + 1, r);',
      '  merge(arr, l, mid, r);',
      '}',
      '',
      'function merge(arr, l, mid, r) {',
      '  let left = arr.slice(l, mid + 1);',
      '  let right = arr.slice(mid + 1, r + 1);',
      '  let i = 0, j = 0, k = l;',
      '  while (i < left.length && j < right.length) {',
      '    if (left[i] <= right[j]) arr[k++] = left[i++];',
      '    else arr[k++] = right[j++];',
      '  }',
      '  while (i < left.length) arr[k++] = left[i++];',
      '  while (j < right.length) arr[k++] = right[j++];',
      '}',
    ],
    cpp: [
      'void merge(vector<int>& arr, int l, int mid, int r) {',
      '    vector<int> left(arr.begin()+l, arr.begin()+mid+1);',
      '    vector<int> right(arr.begin()+mid+1, arr.begin()+r+1);',
      '    int i = 0, j = 0, k = l;',
      '    while (i < left.size() && j < right.size()) {',
      '        if (left[i] <= right[j]) arr[k++] = left[i++];',
      '        else arr[k++] = right[j++];',
      '    }',
      '    while (i < left.size()) arr[k++] = left[i++];',
      '    while (j < right.size()) arr[k++] = right[j++];',
      '}',
      '',
      'void mergeSort(vector<int>& arr, int l, int r) {',
      '    if (l >= r) return;',
      '    int mid = (l + r) / 2;',
      '    mergeSort(arr, l, mid);',
      '    mergeSort(arr, mid + 1, r);',
      '    merge(arr, l, mid, r);',
      '}',
    ],
    c: [
      'void merge(int arr[], int l, int mid, int r) {',
      '    int n1 = mid - l + 1, n2 = r - mid;',
      '    int left[n1], right[n2];',
      '    for (int i = 0; i < n1; i++) left[i] = arr[l+i];',
      '    for (int j = 0; j < n2; j++) right[j] = arr[mid+1+j];',
      '    int i = 0, j = 0, k = l;',
      '    while (i < n1 && j < n2) {',
      '        if (left[i] <= right[j]) arr[k++] = left[i++];',
      '        else arr[k++] = right[j++];',
      '    }',
      '    while (i < n1) arr[k++] = left[i++];',
      '    while (j < n2) arr[k++] = right[j++];',
      '}',
      '',
      'void mergeSort(int arr[], int l, int r) {',
      '    if (l >= r) return;',
      '    int mid = (l + r) / 2;',
      '    mergeSort(arr, l, mid);',
      '    mergeSort(arr, mid + 1, r);',
      '    merge(arr, l, mid, r);',
      '}',
    ],
    python: [
      'def merge_sort(arr, l, r):',
      '    if l >= r:',
      '        return',
      '    mid = (l + r) // 2',
      '    merge_sort(arr, l, mid)',
      '    merge_sort(arr, mid + 1, r)',
      '    merge(arr, l, mid, r)',
      '',
      'def merge(arr, l, mid, r):',
      '    left = arr[l:mid + 1]',
      '    right = arr[mid + 1:r + 1]',
      '    i = j = 0',
      '    k = l',
      '    while i < len(left) and j < len(right):',
      '        if left[i] <= right[j]:',
      '            arr[k] = left[i]; i += 1',
      '        else:',
      '            arr[k] = right[j]; j += 1',
      '        k += 1',
      '    while i < len(left):',
      '        arr[k] = left[i]; i += 1; k += 1',
      '    while j < len(right):',
      '        arr[k] = right[j]; j += 1; k += 1',
    ],
    java: [
      'void mergeSort(int[] arr, int l, int r) {',
      '    if (l >= r) return;',
      '    int mid = (l + r) / 2;',
      '    mergeSort(arr, l, mid);',
      '    mergeSort(arr, mid + 1, r);',
      '    merge(arr, l, mid, r);',
      '}',
      '',
      'void merge(int[] arr, int l, int mid, int r) {',
      '    int[] left = Arrays.copyOfRange(arr, l, mid + 1);',
      '    int[] right = Arrays.copyOfRange(arr, mid + 1, r + 1);',
      '    int i = 0, j = 0, k = l;',
      '    while (i < left.length && j < right.length) {',
      '        if (left[i] <= right[j]) arr[k++] = left[i++];',
      '        else arr[k++] = right[j++];',
      '    }',
      '    while (i < left.length) arr[k++] = left[i++];',
      '    while (j < right.length) arr[k++] = right[j++];',
      '}',
    ],
  },
}

export default function mergeSort(inputArr) {
  const arr = [...inputArr]
  const steps = []

  function mergeSortHelper(l, r) {
    if (l >= r) return

    const mid = Math.floor((l + r) / 2)

    steps.push({
      highlights: Array.from({ length: r - l + 1 }, (_, i) => l + i),
      type: STEP_TYPES.SET,
      codeLine: 2,
      description: `Dividing [${l}..${r}] at mid=${mid}`,
      state: { array: [...arr] },
    })

    mergeSortHelper(l, mid)
    mergeSortHelper(mid + 1, r)
    merge(l, mid, r)
  }

  function merge(l, mid, r) {
    const left = arr.slice(l, mid + 1)
    const right = arr.slice(mid + 1, r + 1)
    let i = 0, j = 0, k = l

    steps.push({
      highlights: Array.from({ length: r - l + 1 }, (_, idx) => l + idx),
      type: STEP_TYPES.MERGE,
      codeLine: 8,
      description: `Merging [${l}..${mid}] and [${mid + 1}..${r}]`,
      state: { array: [...arr] },
    })

    while (i < left.length && j < right.length) {
      steps.push({
        highlights: [k],
        type: STEP_TYPES.COMPARE,
        codeLine: 12,
        description: `Comparing ${left[i]} and ${right[j]}`,
        state: { array: [...arr] },
      })

      if (left[i] <= right[j]) {
        arr[k] = left[i]
        i++
      } else {
        arr[k] = right[j]
        j++
      }

      steps.push({
        highlights: [k],
        type: STEP_TYPES.SET,
        codeLine: left[i - 1] !== undefined ? 13 : 14,
        description: `Placed ${arr[k]} at index ${k}`,
        state: { array: [...arr] },
      })
      k++
    }

    while (i < left.length) {
      arr[k] = left[i]
      steps.push({
        highlights: [k],
        type: STEP_TYPES.SET,
        codeLine: 16,
        description: `Placed remaining ${arr[k]} at index ${k}`,
        state: { array: [...arr] },
      })
      i++
      k++
    }

    while (j < right.length) {
      arr[k] = right[j]
      steps.push({
        highlights: [k],
        type: STEP_TYPES.SET,
        codeLine: 17,
        description: `Placed remaining ${arr[k]} at index ${k}`,
        state: { array: [...arr] },
      })
      j++
      k++
    }
  }

  mergeSortHelper(0, arr.length - 1)

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 18,
    description: 'Array is sorted!',
    state: { array: [...arr], sorted: arr.map((_, i) => i) },
  })

  return steps
}
