import { STEP_TYPES } from '../../engine/types.js'

// ─── Heap represented as array ───
// Parent of i: Math.floor((i - 1) / 2)
// Left child:  2 * i + 1
// Right child: 2 * i + 2

function parentIdx(i) { return Math.floor((i - 1) / 2) }
function leftIdx(i) { return 2 * i + 1 }
function rightIdx(i) { return 2 * i + 2 }

function snapshot(arr) { return [...arr] }

function shouldSwap(arr, i, j, mode) {
  if (mode === 'max') return arr[i] < arr[j]
  return arr[i] > arr[j]  // min-heap
}

// ─── Build tree structure from array for visualization ───
let nextNodeId = 1

export function resetHeapIdCounter() {
  nextNodeId = 1
}

export function arrayToTree(arr) {
  if (arr.length === 0) return null
  const ids = arr.map(() => nextNodeId++)

  function build(i) {
    if (i >= arr.length) return null
    return {
      id: ids[i],
      value: arr[i],
      left: build(leftIdx(i)),
      right: build(rightIdx(i)),
    }
  }

  return { root: build(0), ids }
}

// ─── Insert ───

export function heapInsert(arr, value, mode) {
  const steps = []
  const heap = [...arr]

  heap.push(value)
  let idx = heap.length - 1

  steps.push({
    highlights: [idx],
    type: STEP_TYPES.INSERT,
    codeLine: 1,
    description: `Inserting ${value} at index ${idx}`,
    state: { array: snapshot(heap), activeIndices: [idx], swappingIndices: [] },
  })

  // Bubble up
  while (idx > 0) {
    const p = parentIdx(idx)

    steps.push({
      highlights: [idx, p],
      type: STEP_TYPES.COMPARE,
      codeLine: 2,
      description: `Comparing ${heap[idx]} (index ${idx}) with parent ${heap[p]} (index ${p})`,
      state: { array: snapshot(heap), activeIndices: [idx, p], swappingIndices: [] },
    })

    if (shouldSwap(heap, p, idx, mode)) {
      ;[heap[p], heap[idx]] = [heap[idx], heap[p]]
      steps.push({
        highlights: [idx, p],
        type: STEP_TYPES.SWAP,
        codeLine: 3,
        description: `Swapping ${heap[p]} and ${heap[idx]}`,
        state: { array: snapshot(heap), activeIndices: [p], swappingIndices: [idx, p] },
      })
      idx = p
    } else {
      steps.push({
        highlights: [idx],
        type: STEP_TYPES.DONE,
        codeLine: 4,
        description: `Heap property satisfied at index ${idx}`,
        state: { array: snapshot(heap), activeIndices: [idx], swappingIndices: [] },
      })
      break
    }
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 5,
    description: `Insert complete — ${value} placed at correct position`,
    state: { array: snapshot(heap), activeIndices: [], swappingIndices: [] },
  })

  return { steps, array: heap }
}

// ─── Extract (remove root) ───

export function heapExtract(arr, mode) {
  const steps = []

  if (arr.length === 0) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'Heap is empty — nothing to extract',
      state: { array: [], activeIndices: [], swappingIndices: [] },
    })
    return { steps, array: [], extracted: null }
  }

  const heap = [...arr]
  const extracted = heap[0]

  steps.push({
    highlights: [0],
    type: STEP_TYPES.DELETE,
    codeLine: 0,
    description: `Extracting root: ${extracted}`,
    state: { array: snapshot(heap), activeIndices: [0], swappingIndices: [] },
  })

  if (heap.length === 1) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 5,
      description: `Extracted ${extracted} — heap is now empty`,
      state: { array: [], activeIndices: [], swappingIndices: [] },
    })
    return { steps, array: [], extracted }
  }

  // Move last to root
  heap[0] = heap[heap.length - 1]
  heap.pop()

  steps.push({
    highlights: [0],
    type: STEP_TYPES.SET,
    codeLine: 1,
    description: `Moving last element ${heap[0]} to root`,
    state: { array: snapshot(heap), activeIndices: [0], swappingIndices: [] },
  })

  // Heapify down
  let idx = 0
  while (true) {
    const left = leftIdx(idx)
    const right = rightIdx(idx)
    let target = idx

    if (left < heap.length) {
      steps.push({
        highlights: [idx, left],
        type: STEP_TYPES.COMPARE,
        codeLine: 2,
        description: `Comparing ${heap[idx]} (index ${idx}) with left child ${heap[left]} (index ${left})`,
        state: { array: snapshot(heap), activeIndices: [idx, left], swappingIndices: [] },
      })
      if (shouldSwap(heap, target, left, mode)) target = left
    }

    if (right < heap.length) {
      steps.push({
        highlights: [idx, right],
        type: STEP_TYPES.COMPARE,
        codeLine: 2,
        description: `Comparing ${heap[target]} (index ${target}) with right child ${heap[right]} (index ${right})`,
        state: { array: snapshot(heap), activeIndices: [idx, right], swappingIndices: [] },
      })
      if (shouldSwap(heap, target, right, mode)) target = right
    }

    if (target !== idx) {
      ;[heap[idx], heap[target]] = [heap[target], heap[idx]]
      steps.push({
        highlights: [idx, target],
        type: STEP_TYPES.SWAP,
        codeLine: 3,
        description: `Swapping ${heap[idx]} and ${heap[target]}`,
        state: { array: snapshot(heap), activeIndices: [target], swappingIndices: [idx, target] },
      })
      idx = target
    } else {
      steps.push({
        highlights: [idx],
        type: STEP_TYPES.DONE,
        codeLine: 4,
        description: `Heap property restored at index ${idx}`,
        state: { array: snapshot(heap), activeIndices: [idx], swappingIndices: [] },
      })
      break
    }
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 5,
    description: `Extract complete — removed ${extracted}`,
    state: { array: snapshot(heap), activeIndices: [], swappingIndices: [] },
  })

  return { steps, array: heap, extracted }
}

// ─── Heapify (build heap from unsorted array) ───

export function heapify(arr, mode) {
  const steps = []
  const heap = [...arr]

  steps.push({
    highlights: [],
    type: STEP_TYPES.VISIT,
    codeLine: 0,
    description: `Building ${mode}-heap from array [${heap.join(', ')}]`,
    state: { array: snapshot(heap), activeIndices: [], swappingIndices: [] },
  })

  // Start from last non-leaf
  for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) {
    siftDown(heap, i, heap.length, mode, steps)
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 5,
    description: `Heapify complete — valid ${mode}-heap built`,
    state: { array: snapshot(heap), activeIndices: [], swappingIndices: [] },
  })

  return { steps, array: heap }
}

function siftDown(heap, idx, size, mode, steps) {
  while (true) {
    const left = leftIdx(idx)
    const right = rightIdx(idx)
    let target = idx

    if (left < size) {
      steps.push({
        highlights: [idx, left],
        type: STEP_TYPES.COMPARE,
        codeLine: 2,
        description: `Comparing ${heap[idx]} (index ${idx}) with left child ${heap[left]} (index ${left})`,
        state: { array: snapshot(heap), activeIndices: [idx, left], swappingIndices: [] },
      })
      if (shouldSwap(heap, target, left, mode)) target = left
    }

    if (right < size) {
      steps.push({
        highlights: [idx, right],
        type: STEP_TYPES.COMPARE,
        codeLine: 2,
        description: `Comparing ${heap[target]} (index ${target}) with right child ${heap[right]} (index ${right})`,
        state: { array: snapshot(heap), activeIndices: [idx, right], swappingIndices: [] },
      })
      if (shouldSwap(heap, target, right, mode)) target = right
    }

    if (target !== idx) {
      ;[heap[idx], heap[target]] = [heap[target], heap[idx]]
      steps.push({
        highlights: [idx, target],
        type: STEP_TYPES.SWAP,
        codeLine: 3,
        description: `Swapping ${heap[idx]} and ${heap[target]}`,
        state: { array: snapshot(heap), activeIndices: [target], swappingIndices: [idx, target] },
      })
      idx = target
    } else {
      break
    }
  }
}

// ─── Peek ───

export function heapPeek(arr, mode) {
  const steps = []
  if (arr.length === 0) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'Heap is empty',
      state: { array: [], activeIndices: [], swappingIndices: [] },
    })
    return { steps }
  }

  steps.push({
    highlights: [0],
    type: STEP_TYPES.FOUND,
    codeLine: 0,
    description: `${mode === 'max' ? 'Maximum' : 'Minimum'} element is ${arr[0]} (root)`,
    state: { array: snapshot(arr), activeIndices: [0], swappingIndices: [] },
  })

  return { steps }
}

// ─── Meta ───

export const heapMeta = {
  id: 'heap',
  name: 'Binary Heap',
  category: 'heap',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(n)',
  bestCase: 'O(1)',
  worstCase: 'O(log n)',
  stable: false,
  description:
    'A complete binary tree where each parent is greater (max-heap) or smaller (min-heap) than its children. Stored as an array.',
  code: {
    javascript: [
      'class Heap {',
      '  constructor(mode = "max") {',
      '    this.data = [];',
      '    this.mode = mode;',
      '  }',
      '',
      '  insert(value) {',
      '    this.data.push(value);',
      '    let i = this.data.length - 1;',
      '    while (i > 0) {',
      '      const p = Math.floor((i - 1) / 2);',
      '      if (!this.shouldSwap(p, i)) break;',
      '      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];',
      '      i = p;',
      '    }',
      '  }',
      '',
      '  extract() {',
      '    if (this.data.length === 0) return null;',
      '    const root = this.data[0];',
      '    this.data[0] = this.data.pop();',
      '    this.heapifyDown(0);',
      '    return root;',
      '  }',
      '',
      '  heapifyDown(i) {',
      '    const n = this.data.length;',
      '    let target = i;',
      '    const left = 2 * i + 1;',
      '    const right = 2 * i + 2;',
      '    if (left < n && this.shouldSwap(target, left))',
      '      target = left;',
      '    if (right < n && this.shouldSwap(target, right))',
      '      target = right;',
      '    if (target !== i) {',
      '      [this.data[i], this.data[target]] =',
      '        [this.data[target], this.data[i]];',
      '      this.heapifyDown(target);',
      '    }',
      '  }',
      '}',
    ],
    cpp: [
      '#include <vector>',
      '#include <algorithm>',
      'using namespace std;',
      '',
      'class MaxHeap {',
      '    vector<int> data;',
      '',
      '    void siftUp(int i) {',
      '        while (i > 0) {',
      '            int p = (i - 1) / 2;',
      '            if (data[p] >= data[i]) break;',
      '            swap(data[p], data[i]);',
      '            i = p;',
      '        }',
      '    }',
      '',
      '    void siftDown(int i) {',
      '        int n = data.size();',
      '        while (true) {',
      '            int target = i;',
      '            int left = 2*i+1, right = 2*i+2;',
      '            if (left < n && data[left] > data[target])',
      '                target = left;',
      '            if (right < n && data[right] > data[target])',
      '                target = right;',
      '            if (target == i) break;',
      '            swap(data[i], data[target]);',
      '            i = target;',
      '        }',
      '    }',
      '',
      'public:',
      '    void insert(int val) {',
      '        data.push_back(val);',
      '        siftUp(data.size() - 1);',
      '    }',
      '',
      '    int extract() {',
      '        int root = data[0];',
      '        data[0] = data.back();',
      '        data.pop_back();',
      '        siftDown(0);',
      '        return root;',
      '    }',
      '};',
    ],
    c: [
      'typedef struct {',
      '    int data[100];',
      '    int size;',
      '} Heap;',
      '',
      'void swap(int *a, int *b) {',
      '    int tmp = *a; *a = *b; *b = tmp;',
      '}',
      '',
      'void siftUp(Heap *h, int i) {',
      '    while (i > 0) {',
      '        int p = (i - 1) / 2;',
      '        if (h->data[p] >= h->data[i]) break;',
      '        swap(&h->data[p], &h->data[i]);',
      '        i = p;',
      '    }',
      '}',
      '',
      'void siftDown(Heap *h, int i) {',
      '    while (1) {',
      '        int target = i;',
      '        int left = 2*i+1, right = 2*i+2;',
      '        if (left < h->size && h->data[left] > h->data[target])',
      '            target = left;',
      '        if (right < h->size && h->data[right] > h->data[target])',
      '            target = right;',
      '        if (target == i) break;',
      '        swap(&h->data[i], &h->data[target]);',
      '        i = target;',
      '    }',
      '}',
      '',
      'void insert(Heap *h, int val) {',
      '    h->data[h->size] = val;',
      '    siftUp(h, h->size++);',
      '}',
      '',
      'int extract(Heap *h) {',
      '    int root = h->data[0];',
      '    h->data[0] = h->data[--h->size];',
      '    siftDown(h, 0);',
      '    return root;',
      '}',
    ],
    python: [
      'class Heap:',
      '    def __init__(self, mode="max"):',
      '        self.data = []',
      '        self.mode = mode',
      '',
      '    def insert(self, value):',
      '        self.data.append(value)',
      '        i = len(self.data) - 1',
      '        while i > 0:',
      '            p = (i - 1) // 2',
      '            if not self._should_swap(p, i):',
      '                break',
      '            self.data[p], self.data[i] = \\',
      '                self.data[i], self.data[p]',
      '            i = p',
      '',
      '    def extract(self):',
      '        if not self.data: return None',
      '        root = self.data[0]',
      '        self.data[0] = self.data.pop()',
      '        self._sift_down(0)',
      '        return root',
      '',
      '    def _sift_down(self, i):',
      '        n = len(self.data)',
      '        target = i',
      '        left, right = 2*i+1, 2*i+2',
      '        if left < n and self._should_swap(target, left):',
      '            target = left',
      '        if right < n and self._should_swap(target, right):',
      '            target = right',
      '        if target != i:',
      '            self.data[i], self.data[target] = \\',
      '                self.data[target], self.data[i]',
      '            self._sift_down(target)',
    ],
    java: [
      'import java.util.ArrayList;',
      '',
      'class Heap {',
      '    ArrayList<Integer> data = new ArrayList<>();',
      '',
      '    void insert(int value) {',
      '        data.add(value);',
      '        int i = data.size() - 1;',
      '        while (i > 0) {',
      '            int p = (i - 1) / 2;',
      '            if (data.get(p) >= data.get(i)) break;',
      '            Collections.swap(data, p, i);',
      '            i = p;',
      '        }',
      '    }',
      '',
      '    int extract() {',
      '        int root = data.get(0);',
      '        data.set(0, data.remove(data.size()-1));',
      '        siftDown(0);',
      '        return root;',
      '    }',
      '',
      '    void siftDown(int i) {',
      '        int n = data.size();',
      '        int target = i;',
      '        int left = 2*i+1, right = 2*i+2;',
      '        if (left < n && data.get(left) > data.get(target))',
      '            target = left;',
      '        if (right < n && data.get(right) > data.get(target))',
      '            target = right;',
      '        if (target != i) {',
      '            Collections.swap(data, i, target);',
      '            siftDown(target);',
      '        }',
      '    }',
      '}',
    ],
  },
}
