import bubbleSort from '../visualizers/sorting/algorithms/bubbleSort.js'
import selectionSort from '../visualizers/sorting/algorithms/selectionSort.js'
import linearSearch from '../visualizers/searching/algorithms/linearSearch.js'
import binarySearch from '../visualizers/searching/algorithms/binarySearch.js'
import bfs from '../visualizers/graph/algorithms/bfs.js'
import dfs from '../visualizers/graph/algorithms/dfs.js'
import { STEP_TYPES } from '../engine/types.js'

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomArray(size, min = 5, max = 80) {
  const seen = new Set()
  const out = []
  while (out.length < size) {
    const v = randomInt(min, max)
    if (!seen.has(v)) {
      seen.add(v)
      out.push(v)
    }
  }
  return out
}

function makeChoices(correct, distractors) {
  const pool = [correct, ...distractors]
  const dedup = []
  const seen = new Set()
  for (const c of pool) {
    const key = typeof c === 'object' ? JSON.stringify(c) : String(c)
    if (!seen.has(key)) {
      seen.add(key)
      dedup.push(c)
    }
  }
  while (dedup.length < 4) {
    dedup.push(`Option ${dedup.length + 1}`)
  }
  const shuffled = shuffle(dedup.slice(0, 4))
  const correctKey =
    typeof correct === 'object' ? JSON.stringify(correct) : String(correct)
  const correctIndex = shuffled.findIndex((c) => {
    const k = typeof c === 'object' ? JSON.stringify(c) : String(c)
    return k === correctKey
  })
  return { choices: shuffled, correctIndex }
}

function pickTemplate(templates) {
  return templates[randomInt(0, templates.length - 1)]()
}

function fromKnowledge(category, entry) {
  const { choices, correctIndex } = makeChoices(entry.correct, entry.distractors)
  return {
    category,
    prompt: entry.prompt,
    choices,
    correctIndex,
    explanation: entry.explanation,
  }
}

// ==========================================================================
// SORTING - Bubble Sort
// ==========================================================================

function bubbleSortNextStepTemplate() {
  const size = randomInt(6, 8)
  const arr = randomArray(size)
  const steps = bubbleSort(arr)
  const compareIndices = []
  for (let i = 0; i < steps.length - 1; i++) {
    if (steps[i].type === 'compare') compareIndices.push(i)
  }
  if (compareIndices.length === 0) return bubbleSortNextStepTemplate()

  const stepIdx = compareIndices[randomInt(0, compareIndices.length - 1)]
  const step = steps[stepIdx]
  const next = steps[stepIdx + 1]
  const [i, j] = step.highlights
  const arrState = step.state.array

  const correct =
    next.type === 'swap'
      ? `Swap indices ${i} and ${j}`
      : `Move on — no swap needed`
  const distractors = [
    `Swap indices ${i} and ${j}`,
    `Move on — no swap needed`,
    `Restart from index 0`,
    `Mark the array as fully sorted`,
  ].filter((d) => d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)

  return {
    category: 'Bubble Sort',
    prompt: `Bubble sort just compared arr[${i}] = ${arrState[i]} and arr[${j}] = ${arrState[j]}. What happens next?`,
    arrayPreview: arrState,
    highlights: [i, j],
    choices,
    correctIndex,
    explanation:
      next.type === 'swap'
        ? `Because arr[${i}] (${arrState[i]}) > arr[${j}] (${arrState[j]}), bubble sort swaps them.`
        : `Because arr[${i}] (${arrState[i]}) ≤ arr[${j}] (${arrState[j]}), no swap is needed — move on.`,
  }
}

function bubbleSortAfterPassTemplate() {
  const size = randomInt(5, 7)
  const arr = randomArray(size)
  const passes = randomInt(1, size - 2)

  const working = [...arr]
  for (let p = 0; p < passes; p++) {
    for (let k = 0; k < working.length - 1 - p; k++) {
      if (working[k] > working[k + 1]) {
        ;[working[k], working[k + 1]] = [working[k + 1], working[k]]
      }
    }
  }

  const correct = working.join(', ')
  const distractors = [
    [...arr].sort((a, b) => a - b).join(', '),
    [...arr].reverse().join(', '),
    arr.join(', '),
  ].filter((d) => d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Bubble Sort',
    prompt: `Starting with [${arr.join(', ')}], what does the array look like after ${passes} complete pass${passes === 1 ? '' : 'es'} of bubble sort?`,
    arrayPreview: arr,
    choices,
    correctIndex,
    explanation: `After ${passes} pass${passes === 1 ? '' : 'es'}, the largest ${passes} element${passes === 1 ? '' : 's'} bubble to the end. Result: [${correct}].`,
  }
}

const BUBBLE_KNOWLEDGE = [
  {
    prompt: 'What is the worst-case time complexity of bubble sort?',
    correct: 'O(n²)',
    distractors: ['O(n)', 'O(n log n)', 'O(log n)'],
    explanation: 'Two nested loops over n elements → O(n²).',
  },
  {
    prompt: 'With the early-exit optimization, what is bubble sort\'s best-case time on already-sorted input?',
    correct: 'O(n)',
    distractors: ['O(n²)', 'O(n log n)', 'O(1)'],
    explanation: 'A single pass with no swaps triggers early exit — n-1 comparisons.',
  },
  {
    prompt: 'Is bubble sort stable?',
    correct: 'Yes',
    distractors: ['No', 'Only on integers', 'Depends on implementation'],
    explanation: 'Bubble sort only swaps adjacent elements when strictly greater, so equal keys keep their relative order.',
  },
  {
    prompt: 'Worst-case number of swaps for bubble sort on n elements?',
    correct: 'n(n-1)/2',
    distractors: ['n', 'n log n', '2n'],
    explanation: 'Reverse-sorted input forces every adjacent pair to swap across all passes.',
  },
  {
    prompt: 'Is bubble sort an in-place algorithm?',
    correct: 'Yes',
    distractors: ['No', 'Only for small arrays', 'Depends on data type'],
    explanation: 'It needs only O(1) extra space beyond the input array.',
  },
  {
    prompt: 'After k complete passes of bubble sort on n elements, what is guaranteed?',
    correct: 'The largest k elements are in their final positions',
    distractors: [
      'The smallest k elements are sorted',
      'The array is fully sorted',
      'Nothing is guaranteed',
    ],
    explanation: 'Each pass bubbles the next-largest remaining element to the end.',
  },
]

function makeBubbleSortQuestion() {
  const templates = [
    bubbleSortNextStepTemplate,
    bubbleSortNextStepTemplate,
    bubbleSortAfterPassTemplate,
    () => fromKnowledge('Bubble Sort', BUBBLE_KNOWLEDGE[randomInt(0, BUBBLE_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// SORTING - Selection Sort
// ==========================================================================

function selectionSortMinTemplate() {
  const size = randomInt(6, 8)
  const arr = randomArray(size)
  const steps = selectionSort(arr)
  const compareSteps = []
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].type === STEP_TYPES.COMPARE && steps[i].state?.minIdx != null) {
      compareSteps.push(i)
    }
  }
  if (compareSteps.length === 0) return selectionSortMinTemplate()

  const stepIdx = compareSteps[randomInt(0, compareSteps.length - 1)]
  const step = steps[stepIdx]
  const arrState = step.state.array
  const minIdx = step.state.minIdx
  const scanning = step.highlights[0]

  const correct = `arr[${minIdx}] = ${arrState[minIdx]}`
  const distractors = [
    `arr[${scanning}] = ${arrState[scanning]}`,
    `arr[0] = ${arrState[0]}`,
    `arr[${arrState.length - 1}] = ${arrState[arrState.length - 1]}`,
  ].filter((d) => d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)

  return {
    category: 'Selection Sort',
    prompt: `Selection sort is scanning for the minimum. Currently comparing arr[${scanning}] = ${arrState[scanning]} against the running minimum. Which value is currently tracked as the minimum?`,
    arrayPreview: arrState,
    highlights: [scanning, minIdx],
    choices,
    correctIndex,
    explanation: `Selection sort tracks the min index as it scans. Right now that's index ${minIdx} with value ${arrState[minIdx]}.`,
  }
}

function selectionSortAfterPassTemplate() {
  const size = randomInt(5, 7)
  const arr = randomArray(size)
  const passes = randomInt(1, size - 2)

  const working = [...arr]
  for (let i = 0; i < passes; i++) {
    let minI = i
    for (let j = i + 1; j < working.length; j++) {
      if (working[j] < working[minI]) minI = j
    }
    if (minI !== i) [working[i], working[minI]] = [working[minI], working[i]]
  }

  const correct = working.join(', ')
  const distractors = [
    [...arr].sort((a, b) => a - b).join(', '),
    [...working].reverse().join(', '),
    arr.join(', '),
  ].filter((d) => d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Selection Sort',
    prompt: `Starting with [${arr.join(', ')}], what does the array look like after ${passes} iteration${passes === 1 ? '' : 's'} of selection sort?`,
    arrayPreview: arr,
    choices,
    correctIndex,
    explanation: `Selection sort places the smallest remaining element at position i on iteration i. After ${passes}: [${correct}].`,
  }
}

const SELECTION_KNOWLEDGE = [
  {
    prompt: 'What is the time complexity of selection sort in all cases (best, average, worst)?',
    correct: 'O(n²)',
    distractors: ['O(n log n)', 'O(n)', 'O(n) best, O(n²) worst'],
    explanation: 'Selection sort always scans the entire unsorted portion — no early-exit opportunity.',
  },
  {
    prompt: 'How many swaps does selection sort perform in the worst case on n elements?',
    correct: 'n - 1',
    distractors: ['n²', 'n(n-1)/2', 'log n'],
    explanation: 'One swap per iteration and there are n-1 iterations.',
  },
  {
    prompt: 'Is the standard selection sort stable?',
    correct: 'No',
    distractors: ['Yes', 'Only on sorted input', 'Only with integers'],
    explanation: 'Swapping the min with arr[i] can move an equal key past another — breaks stability.',
  },
  {
    prompt: 'What does selection sort guarantee after iteration i (0-indexed)?',
    correct: 'arr[0..i] contains the smallest i+1 elements in sorted order',
    distractors: [
      'arr[n-i..n-1] contains the largest i+1 elements in sorted order',
      'The entire array is sorted',
      'Nothing useful — the invariant is random',
    ],
    explanation: 'Each iteration selects and places the next-smallest element at index i.',
  },
  {
    prompt: 'Which is more common for selection sort — more comparisons or more swaps?',
    correct: 'More comparisons (Θ(n²)) vs fewer swaps (Θ(n))',
    distractors: [
      'Equal number of each',
      'More swaps than comparisons',
      'Neither — both are O(n log n)',
    ],
    explanation: 'Selection sort minimizes swaps, which makes it useful when write cost is high.',
  },
]

function makeSelectionSortQuestion() {
  const templates = [
    selectionSortMinTemplate,
    selectionSortMinTemplate,
    selectionSortAfterPassTemplate,
    () => fromKnowledge('Selection Sort', SELECTION_KNOWLEDGE[randomInt(0, SELECTION_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// SORTING - Insertion Sort
// ==========================================================================

function insertionSortPositionTemplate() {
  const size = randomInt(5, 7)
  const arr = randomArray(size)
  const idx = randomInt(1, size - 1)
  const sortedPrefix = [...arr.slice(0, idx)].sort((a, b) => a - b)
  const key = arr[idx]
  let finalPos = sortedPrefix.length
  for (let i = 0; i < sortedPrefix.length; i++) {
    if (key < sortedPrefix[i]) {
      finalPos = i
      break
    }
  }

  const correct = `Index ${finalPos}`
  const distractors = [
    `Index ${Math.max(0, finalPos - 1)}`,
    `Index ${Math.min(sortedPrefix.length, finalPos + 1)}`,
    `Index ${sortedPrefix.length}`,
  ].filter((d, i, a) => a.indexOf(d) === i && d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)

  return {
    category: 'Insertion Sort',
    prompt: `Insertion sort: the sorted prefix is [${sortedPrefix.join(', ')}] and the key being inserted is ${key}. At which index (within the new prefix) does ${key} land?`,
    arrayPreview: [...sortedPrefix, key],
    highlights: [sortedPrefix.length],
    choices,
    correctIndex,
    explanation: `Scanning from the right, ${key} goes at index ${finalPos} so the prefix stays sorted.`,
  }
}

function insertionSortShiftsTemplate() {
  const size = randomInt(5, 7)
  const arr = randomArray(size)
  const idx = randomInt(1, size - 1)
  const sortedPrefix = [...arr.slice(0, idx)].sort((a, b) => a - b)
  const key = arr[idx]
  let shifts = 0
  for (let i = sortedPrefix.length - 1; i >= 0; i--) {
    if (sortedPrefix[i] > key) shifts++
    else break
  }

  const correct = String(shifts)
  const distractors = [
    String(Math.max(0, shifts - 1)),
    String(shifts + 1),
    String(sortedPrefix.length),
  ].filter((d, i, a) => a.indexOf(d) === i && d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Insertion Sort',
    prompt: `Insertion sort inserts key = ${key} into sorted prefix [${sortedPrefix.join(', ')}]. How many shifts (right-moves) occur?`,
    choices,
    correctIndex,
    explanation: `${shifts} element${shifts === 1 ? '' : 's'} in the prefix are greater than ${key}, so ${shifts} shift${shifts === 1 ? '' : 's'} occur.`,
  }
}

const INSERTION_KNOWLEDGE = [
  {
    prompt: 'Best-case time complexity of insertion sort (on already-sorted input)?',
    correct: 'O(n)',
    distractors: ['O(n²)', 'O(n log n)', 'O(log n)'],
    explanation: 'The inner while loop exits immediately on each iteration → single linear pass.',
  },
  {
    prompt: 'Worst-case time complexity of insertion sort?',
    correct: 'O(n²)',
    distractors: ['O(n log n)', 'O(n)', 'O(log n)'],
    explanation: 'A reverse-sorted array forces the key to shift all the way left each iteration.',
  },
  {
    prompt: 'Is insertion sort stable?',
    correct: 'Yes',
    distractors: ['No', 'Only with a comparator', 'Depends on input'],
    explanation: 'Equal elements are never overtaken because the inner loop stops at `arr[j] > key` (strict).',
  },
  {
    prompt: 'Is insertion sort an online algorithm (can sort as data arrives)?',
    correct: 'Yes',
    distractors: ['No', 'Only for integers', 'Only if buffered'],
    explanation: 'Each new element can be inserted into the already-sorted prefix immediately.',
  },
  {
    prompt: 'For what kind of input is insertion sort typically preferred?',
    correct: 'Small or nearly-sorted arrays',
    distractors: [
      'Large random arrays',
      'Arrays with many duplicates',
      'Reverse-sorted data',
    ],
    explanation: 'Low constant factor + O(n) best case make it great for small n and near-sorted data.',
  },
]

function makeInsertionSortQuestion() {
  const templates = [
    insertionSortPositionTemplate,
    insertionSortPositionTemplate,
    insertionSortShiftsTemplate,
    () => fromKnowledge('Insertion Sort', INSERTION_KNOWLEDGE[randomInt(0, INSERTION_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// SORTING - Merge Sort
// ==========================================================================

function mergeFirstElementTemplate() {
  const leftSize = randomInt(3, 4)
  const rightSize = randomInt(3, 4)
  const pool = randomArray(leftSize + rightSize + 2)
  const left = pool.slice(0, leftSize).sort((a, b) => a - b)
  const right = pool.slice(leftSize, leftSize + rightSize).sort((a, b) => a - b)

  const first = left[0] < right[0] ? left[0] : right[0]
  const correct = String(first)
  const distractors = [
    String(left[0]),
    String(right[0]),
    String(left[left.length - 1]),
    String(right[right.length - 1]),
  ].filter((d, i, a) => a.indexOf(d) === i && d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)

  return {
    category: 'Merge Sort',
    prompt: `Merging sorted halves: left = [${left.join(', ')}], right = [${right.join(', ')}]. Which value is written to the merged array first?`,
    choices,
    correctIndex,
    explanation: `Compare left[0] = ${left[0]} with right[0] = ${right[0]}; the smaller one (${first}) is placed first.`,
  }
}

function mergeFullResultTemplate() {
  const leftSize = randomInt(3, 4)
  const rightSize = randomInt(3, 4)
  const pool = randomArray(leftSize + rightSize + 2)
  const left = pool.slice(0, leftSize).sort((a, b) => a - b)
  const right = pool.slice(leftSize, leftSize + rightSize).sort((a, b) => a - b)

  const merged = []
  let i = 0
  let j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) merged.push(left[i++])
    else merged.push(right[j++])
  }
  while (i < left.length) merged.push(left[i++])
  while (j < right.length) merged.push(right[j++])

  const correct = merged.join(', ')
  const distractors = [
    [...left, ...right].join(', '),
    [...right, ...left].join(', '),
    [...merged].reverse().join(', '),
  ].filter((d) => d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Merge Sort',
    prompt: `Merge left = [${left.join(', ')}] and right = [${right.join(', ')}]. What is the merged result?`,
    choices,
    correctIndex,
    explanation: `Pick the smaller head each step, then drain the remainder → [${correct}].`,
  }
}

const MERGE_KNOWLEDGE = [
  {
    prompt: 'What is the time complexity of merge sort in all cases?',
    correct: 'O(n log n)',
    distractors: ['O(n²)', 'O(n)', 'O(log n)'],
    explanation: 'log n levels of splitting, each level does O(n) merging work.',
  },
  {
    prompt: 'Auxiliary space complexity of standard merge sort on arrays?',
    correct: 'O(n)',
    distractors: ['O(1)', 'O(log n)', 'O(n²)'],
    explanation: 'Merging requires a temporary buffer of size O(n).',
  },
  {
    prompt: 'Is merge sort stable?',
    correct: 'Yes',
    distractors: ['No', 'Only with careful pivot choice', 'Depends on language'],
    explanation: 'Using `≤` in the merge step preserves the original order of equal keys.',
  },
  {
    prompt: 'Merge sort on linked lists has what space advantage?',
    correct: 'It can be done in O(1) auxiliary space (no buffer needed)',
    distractors: [
      'Still needs O(n) buffer',
      'Requires O(log n) extra space only',
      'It cannot sort linked lists',
    ],
    explanation: 'Rewiring next pointers lets you merge in place without allocating a buffer.',
  },
  {
    prompt: 'Which is a typical use case where merge sort shines over quick sort?',
    correct: 'External sorting (data larger than memory)',
    distractors: [
      'In-place sorting with tight memory',
      'Sorting small already-sorted arrays',
      'Cache-optimized sorting',
    ],
    explanation: 'Merge sort streams sequential reads/writes — ideal for disk or tape.',
  },
]

function makeMergeSortQuestion() {
  const templates = [
    mergeFirstElementTemplate,
    mergeFirstElementTemplate,
    mergeFullResultTemplate,
    () => fromKnowledge('Merge Sort', MERGE_KNOWLEDGE[randomInt(0, MERGE_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// SORTING - Quick Sort
// ==========================================================================

function quickSortPivotIndexTemplate() {
  const size = randomInt(5, 7)
  const arr = randomArray(size)
  const pivot = arr[arr.length - 1]
  let less = 0
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) less++
  }
  const finalIdx = less

  const correct = `Index ${finalIdx}`
  const distractors = [
    `Index ${Math.max(0, finalIdx - 1)}`,
    `Index ${Math.min(arr.length - 1, finalIdx + 1)}`,
    `Index ${arr.length - 1}`,
    `Index 0`,
  ].filter((d, i, a) => a.indexOf(d) === i && d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)

  return {
    category: 'Quick Sort',
    prompt: `Lomuto partition with pivot = arr[${arr.length - 1}] = ${pivot}. After partitioning, at which final index does the pivot end up?`,
    arrayPreview: arr,
    highlights: [arr.length - 1],
    choices,
    correctIndex,
    explanation: `The pivot lands at the index equal to the count of elements less than it. ${less} elements are less than ${pivot}, so pivot ends up at index ${finalIdx}.`,
  }
}

function quickSortPartitionResultTemplate() {
  const size = randomInt(5, 6)
  const arr = randomArray(size)
  const pivot = arr[arr.length - 1]
  const less = arr.slice(0, -1).filter((x) => x < pivot)
  const greater = arr.slice(0, -1).filter((x) => x >= pivot)
  const partitioned = [...less, pivot, ...greater]

  const correct = `[${partitioned.join(', ')}]`
  const distractors = [
    `[${[...greater, pivot, ...less].join(', ')}]`,
    `[${[...arr].sort((a, b) => a - b).join(', ')}]`,
    `[${arr.join(', ')}]`,
  ].filter((d) => d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Quick Sort',
    prompt: `Lomuto partition with pivot = ${pivot} on [${arr.join(', ')}]. Which shows a correct state after partitioning (pivot in final position, smaller left, larger right)?`,
    arrayPreview: arr,
    highlights: [arr.length - 1],
    choices,
    correctIndex,
    explanation: `All elements < ${pivot} go left, pivot sits between, remaining go right → [${partitioned.join(', ')}].`,
  }
}

const QUICK_KNOWLEDGE = [
  {
    prompt: 'Average-case time complexity of quick sort?',
    correct: 'O(n log n)',
    distractors: ['O(n²)', 'O(n)', 'O(log n)'],
    explanation: 'With random or median pivots, partitions are balanced on average.',
  },
  {
    prompt: 'Worst-case time complexity of quick sort?',
    correct: 'O(n²)',
    distractors: ['O(n log n)', 'O(n)', 'O(n log² n)'],
    explanation: 'Already-sorted input with last-element pivot creates n-1 sized subproblems each level.',
  },
  {
    prompt: 'Which pivot strategy avoids the O(n²) worst case on sorted input?',
    correct: 'Random pivot (or median-of-three)',
    distractors: [
      'Always pick the first element',
      'Always pick the last element',
      'Always pick the minimum',
    ],
    explanation: 'Randomization or median-of-three makes adversarial ordering extremely unlikely.',
  },
  {
    prompt: 'Is the standard in-place quick sort stable?',
    correct: 'No',
    distractors: ['Yes', 'Only on small arrays', 'Only with Hoare partition'],
    explanation: 'Long-range swaps during partitioning can reorder equal keys.',
  },
  {
    prompt: 'Space complexity of quick sort (recursion stack, average case)?',
    correct: 'O(log n)',
    distractors: ['O(1)', 'O(n)', 'O(n log n)'],
    explanation: 'Balanced partitions → log n recursion depth.',
  },
  {
    prompt: 'Quick sort vs merge sort — which is typically faster in practice on random in-memory data?',
    correct: 'Quick sort (better cache behavior, smaller constants)',
    distractors: [
      'Merge sort (always)',
      'They are identical',
      'Depends only on language',
    ],
    explanation: 'In-place partitioning keeps data cache-hot — quick sort usually wins for in-memory workloads.',
  },
]

function makeQuickSortQuestion() {
  const templates = [
    quickSortPivotIndexTemplate,
    quickSortPivotIndexTemplate,
    quickSortPartitionResultTemplate,
    () => fromKnowledge('Quick Sort', QUICK_KNOWLEDGE[randomInt(0, QUICK_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// ARRAYS - Linear Search
// ==========================================================================

function linearSearchCountTemplate() {
  const size = randomInt(6, 10)
  const arr = randomArray(size)
  const target = arr[randomInt(0, arr.length - 1)]
  linearSearch(arr, target)
  const foundAt = arr.indexOf(target)
  const count = foundAt + 1

  const correct = `${count} comparison${count === 1 ? '' : 's'}`
  const distractors = [
    `${Math.max(1, count - 1)} comparison${count - 1 === 1 ? '' : 's'}`,
    `${count + 1} comparisons`,
    `${arr.length} comparisons`,
  ].filter((d, i, a) => a.indexOf(d) === i && d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)

  return {
    category: 'Linear Search',
    prompt: `Linear searching for ${target} in the array. How many comparisons does it take to find it?`,
    arrayPreview: arr,
    highlights: [foundAt],
    choices,
    correctIndex,
    explanation: `Linear search checks indices left-to-right. ${target} lives at index ${foundAt}, so we make ${count} comparison${count === 1 ? '' : 's'} (including the match).`,
  }
}

function linearSearchMissingTemplate() {
  const size = randomInt(6, 10)
  const arr = randomArray(size, 5, 60)
  let target
  do {
    target = randomInt(70, 99)
  } while (arr.includes(target))

  const correct = `-1 (or a not-found sentinel), after ${arr.length} comparisons`
  const distractors = [
    `The last index (${arr.length - 1})`,
    `0, after 1 comparison`,
    `${Math.floor(arr.length / 2)}, after ${Math.ceil(arr.length / 2)} comparisons`,
  ]

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Linear Search',
    prompt: `Linear searching for ${target} in [${arr.join(', ')}] (where ${target} is not present). What does it return, and how many comparisons occur?`,
    arrayPreview: arr,
    choices,
    correctIndex,
    explanation: `The entire array is scanned (${arr.length} comparisons) and -1 (or similar) is returned.`,
  }
}

const LINEAR_KNOWLEDGE = [
  {
    prompt: 'What is the worst-case time complexity of linear search on n elements?',
    correct: 'O(n)',
    distractors: ['O(log n)', 'O(1)', 'O(n log n)'],
    explanation: 'Worst case scans the entire array.',
  },
  {
    prompt: 'Best-case time complexity of linear search?',
    correct: 'O(1)',
    distractors: ['O(n)', 'O(log n)', 'O(n²)'],
    explanation: 'Target at index 0 → single comparison.',
  },
  {
    prompt: 'Does linear search require the array to be sorted?',
    correct: 'No',
    distractors: ['Yes', 'Only for duplicates', 'Only for integers'],
    explanation: 'Linear search works on any ordering — that\'s its main advantage over binary search.',
  },
  {
    prompt: 'Average number of comparisons for successful linear search on a random array of n elements?',
    correct: '(n+1)/2',
    distractors: ['n', 'log₂ n', '1'],
    explanation: 'The expected index of the target is roughly the middle, giving ~(n+1)/2 comparisons.',
  },
]

function makeLinearSearchQuestion() {
  const templates = [
    linearSearchCountTemplate,
    linearSearchCountTemplate,
    linearSearchMissingTemplate,
    () => fromKnowledge('Linear Search', LINEAR_KNOWLEDGE[randomInt(0, LINEAR_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// ARRAYS - Binary Search
// ==========================================================================

function binarySearchNextActionTemplate() {
  const size = randomInt(8, 12)
  const arr = randomArray(size).sort((a, b) => a - b)
  const target = arr[randomInt(0, arr.length - 1)]
  const steps = binarySearch(arr, target)
  const compareSteps = steps
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.type === 'compare')
  if (compareSteps.length < 2) return binarySearchNextActionTemplate()

  const pick = compareSteps[randomInt(0, compareSteps.length - 2)]
  const step = pick.s
  const next = steps[pick.i + 1]
  const { low, high, mid } = step.state

  let correct
  if (next.type === 'found') {
    correct = `Return index ${mid}`
  } else if (next.state.low > low) {
    correct = `Search right half (low = ${mid + 1})`
  } else {
    correct = `Search left half (high = ${mid - 1})`
  }
  const distractors = [
    `Search right half (low = ${mid + 1})`,
    `Search left half (high = ${mid - 1})`,
    `Return index ${mid}`,
    `Give up — target not present`,
  ].filter((d) => d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)

  return {
    category: 'Binary Search',
    prompt: `Binary search looking for ${target}. Currently low=${low}, high=${high}, mid=${mid}, arr[mid]=${step.state.array[mid]}. What's the next action?`,
    arrayPreview: step.state.array,
    highlights: [mid],
    choices,
    correctIndex,
    explanation:
      next.type === 'found'
        ? `arr[${mid}] equals the target, so we return index ${mid}.`
        : next.state.low > low
        ? `arr[${mid}] (${step.state.array[mid]}) < ${target}, so the target must be in the right half.`
        : `arr[${mid}] (${step.state.array[mid]}) > ${target}, so the target must be in the left half.`,
  }
}

function binarySearchMaxStepsTemplate() {
  const n = [8, 16, 32, 64, 128, 256, 1024][randomInt(0, 6)]
  const maxSteps = Math.ceil(Math.log2(n + 1))

  const correct = `${maxSteps}`
  const distractors = [
    `${n / 2}`,
    `${n}`,
    `${maxSteps + 1}`,
    `${maxSteps - 1}`,
  ].filter((d, i, a) => a.indexOf(d) === i && d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Binary Search',
    prompt: `Binary search on a sorted array of ${n} elements — what is the maximum number of comparisons in the worst case?`,
    choices,
    correctIndex,
    explanation: `Each step halves the search space: ⌈log₂(${n}+1)⌉ = ${maxSteps} comparisons worst case.`,
  }
}

const BINARY_KNOWLEDGE = [
  {
    prompt: 'What is the precondition for binary search to work correctly?',
    correct: 'The array must be sorted',
    distractors: [
      'The array must contain unique elements',
      'The array must have power-of-two size',
      'No precondition',
    ],
    explanation: 'Binary search relies on comparing with the middle to eliminate half the range.',
  },
  {
    prompt: 'Time complexity of binary search on n elements?',
    correct: 'O(log n)',
    distractors: ['O(n)', 'O(n log n)', 'O(1)'],
    explanation: 'Each step halves the remaining search space.',
  },
  {
    prompt: 'What is a common off-by-one pitfall in binary search?',
    correct: 'Using `low <= high` vs `low < high` inconsistently with mid update rules',
    distractors: [
      'Using integer division',
      'Comparing with the wrong operator',
      'Returning the wrong type',
    ],
    explanation: 'Termination condition must match whether mid+1/mid-1 or mid is used on updates.',
  },
  {
    prompt: 'Binary search on a linked list — what\'s the problem?',
    correct: 'No O(1) random access, so accessing mid is O(n)',
    distractors: [
      'It works in O(log n) like arrays',
      'Linked lists can\'t be sorted',
      'Binary search needs duplicates',
    ],
    explanation: 'Without random access, finding the middle dominates — binary search degrades to O(n).',
  },
  {
    prompt: 'Which is a safer mid computation to avoid integer overflow?',
    correct: 'low + (high - low) / 2',
    distractors: ['(low + high) / 2', 'high / 2', 'low / 2 + high / 2'],
    explanation: '(low + high) can overflow with large values; low + (high - low) / 2 avoids it.',
  },
]

function makeBinarySearchQuestion() {
  const templates = [
    binarySearchNextActionTemplate,
    binarySearchNextActionTemplate,
    binarySearchMaxStepsTemplate,
    () => fromKnowledge('Binary Search', BINARY_KNOWLEDGE[randomInt(0, BINARY_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// GRAPHS - shared helpers
// ==========================================================================

function makeSimpleGraph() {
  const n = randomInt(5, 6)
  const nodes = Array.from({ length: n }, (_, i) => ({ id: i, label: String(i) }))
  const edges = []
  const seen = new Set()
  for (let i = 1; i < n; i++) {
    const parent = randomInt(0, i - 1)
    edges.push({ source: parent, target: i })
    seen.add(`${Math.min(parent, i)}-${Math.max(parent, i)}`)
  }
  const extra = randomInt(1, 2)
  for (let k = 0; k < extra; k++) {
    const a = randomInt(0, n - 1)
    const b = randomInt(0, n - 1)
    if (a === b) continue
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`
    if (seen.has(key)) continue
    edges.push({ source: a, target: b })
    seen.add(key)
  }
  return { nodes, edges }
}

function adjacencyLines(nodes, edges) {
  return nodes.map((n) => {
    const neighbors = edges
      .filter((e) => e.source === n.id || e.target === n.id)
      .map((e) => (e.source === n.id ? e.target : e.source))
    return `${n.id} → ${neighbors.join(', ') || '(none)'}`
  })
}

// ==========================================================================
// GRAPHS - BFS
// ==========================================================================

function bfsNextVisitTemplate() {
  const { nodes, edges } = makeSimpleGraph()
  const steps = bfs(nodes, edges, 0)
  const candidates = []
  for (let i = 0; i < steps.length - 1; i++) {
    const s = steps[i]
    if (s.state && Array.isArray(s.state.queue) && s.state.queue.length >= 2) {
      candidates.push(i)
    }
  }
  if (candidates.length === 0) return bfsNextVisitTemplate()

  const stepIdx = candidates[randomInt(0, candidates.length - 1)]
  const step = steps[stepIdx]
  const queue = step.state.queue
  const visited = step.state.visited || []

  let nextVisit = null
  for (let i = stepIdx + 1; i < steps.length; i++) {
    if (steps[i].type === 'visit' && steps[i].state?.current != null) {
      nextVisit = steps[i].state.current
      break
    }
  }
  if (nextVisit === null) return bfsNextVisitTemplate()

  const correct = `Node ${nextVisit}`
  const distractorPool = nodes
    .map((n) => n.id)
    .filter((id) => id !== nextVisit)
    .map((id) => `Node ${id}`)
  const distractors = shuffle(distractorPool).slice(0, 3)
  const { choices, correctIndex } = makeChoices(correct, distractors)

  return {
    category: 'BFS',
    prompt: `Running BFS from node 0. Queue: [${queue.join(', ')}]. Visited: {${visited.join(', ')}}. Which node is visited next?`,
    adjacency: adjacencyLines(nodes, edges),
    choices,
    correctIndex,
    explanation: `BFS dequeues from the front. The next node to dequeue (and visit, if not already visited) is Node ${nextVisit}.`,
  }
}

function bfsVisitOrderTemplate() {
  const { nodes, edges } = makeSimpleGraph()
  const steps = bfs(nodes, edges, 0)
  const finalStep = steps[steps.length - 1]
  const order = finalStep.state.visitOrder || []
  if (order.length < nodes.length) return bfsVisitOrderTemplate()

  const correct = order.join(' → ')
  const distractors = [
    [...order].reverse().join(' → '),
    nodes.map((n) => n.id).join(' → '),
    [0, ...shuffle(order.slice(1))].join(' → '),
  ].filter((d) => d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'BFS',
    prompt: `Starting BFS from node 0, which visit order is produced? (Ties broken by smaller neighbor id first.)`,
    adjacency: adjacencyLines(nodes, edges),
    choices,
    correctIndex,
    explanation: `BFS visits by level, ties broken by lower-id neighbor first → ${correct}.`,
  }
}

const BFS_KNOWLEDGE = [
  {
    prompt: 'Which data structure does BFS use to track the frontier?',
    correct: 'Queue (FIFO)',
    distractors: ['Stack (LIFO)', 'Priority queue', 'Hash set'],
    explanation: 'FIFO order guarantees level-by-level exploration.',
  },
  {
    prompt: 'Time complexity of BFS on a graph with V vertices and E edges (adjacency list)?',
    correct: 'O(V + E)',
    distractors: ['O(V²)', 'O(V log E)', 'O(E log V)'],
    explanation: 'Each vertex enqueued/dequeued once; each edge examined once.',
  },
  {
    prompt: 'Which problem does BFS solve efficiently that DFS does not?',
    correct: 'Shortest path in an unweighted graph',
    distractors: [
      'Topological sort',
      'Finding strongly connected components',
      'Detecting back edges',
    ],
    explanation: 'BFS explores in order of distance from the source → first time we visit a node is shortest.',
  },
  {
    prompt: 'BFS space complexity in the worst case?',
    correct: 'O(V)',
    distractors: ['O(1)', 'O(log V)', 'O(E)'],
    explanation: 'Queue and visited set each grow up to V.',
  },
  {
    prompt: 'BFS can detect cycles in a graph by noticing…',
    correct: 'An edge to an already-visited non-parent node',
    distractors: [
      'A node with zero neighbors',
      'Running out of memory',
      'Visiting the start node twice',
    ],
    explanation: 'In undirected BFS, such an edge means a cycle exists.',
  },
]

function makeBFSQuestion() {
  const templates = [
    bfsNextVisitTemplate,
    bfsNextVisitTemplate,
    bfsVisitOrderTemplate,
    () => fromKnowledge('BFS', BFS_KNOWLEDGE[randomInt(0, BFS_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// GRAPHS - DFS
// ==========================================================================

function dfsNextVisitTemplate() {
  const { nodes, edges } = makeSimpleGraph()
  const steps = dfs(nodes, edges, 0)

  const candidates = []
  for (let i = 0; i < steps.length - 1; i++) {
    const s = steps[i]
    if (
      s.state &&
      Array.isArray(s.state.stack) &&
      s.state.stack.length >= 2 &&
      Array.isArray(s.state.visited) &&
      s.state.visited.length >= 1
    ) {
      candidates.push(i)
    }
  }
  if (candidates.length === 0) return dfsNextVisitTemplate()

  const stepIdx = candidates[randomInt(0, candidates.length - 1)]
  const step = steps[stepIdx]
  const stack = step.state.stack
  const visited = step.state.visited || []

  let nextVisit = null
  for (let i = stepIdx + 1; i < steps.length; i++) {
    const s = steps[i]
    if (
      s.type === STEP_TYPES.VISIT &&
      s.state?.current != null &&
      !visited.includes(s.state.current)
    ) {
      nextVisit = s.state.current
      break
    }
  }
  if (nextVisit === null) return dfsNextVisitTemplate()

  const correct = `Node ${nextVisit}`
  const distractorPool = nodes
    .map((n) => n.id)
    .filter((id) => id !== nextVisit)
    .map((id) => `Node ${id}`)
  const distractors = shuffle(distractorPool).slice(0, 3)
  const { choices, correctIndex } = makeChoices(correct, distractors)

  return {
    category: 'DFS',
    prompt: `Running DFS from node 0. Stack (top on right): [${stack.join(', ')}]. Visited: {${visited.join(', ')}}. Which node is visited next?`,
    adjacency: adjacencyLines(nodes, edges),
    choices,
    correctIndex,
    explanation: `DFS pops from the top of the stack and visits the first unvisited node it finds — that's Node ${nextVisit}.`,
  }
}

function dfsVisitOrderTemplate() {
  const { nodes, edges } = makeSimpleGraph()
  const steps = dfs(nodes, edges, 0)
  const finalStep = steps[steps.length - 1]
  const order = finalStep.state.visitOrder || []
  if (order.length < nodes.length) return dfsVisitOrderTemplate()

  const correct = order.join(' → ')
  const distractors = [
    [...order].reverse().join(' → '),
    nodes.map((n) => n.id).join(' → '),
    [0, ...shuffle(order.slice(1))].join(' → '),
  ].filter((d) => d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'DFS',
    prompt: `Starting DFS from node 0 (stack-based, pushing neighbors in reverse to visit smaller-id first), which visit order is produced?`,
    adjacency: adjacencyLines(nodes, edges),
    choices,
    correctIndex,
    explanation: `DFS dives deep on each branch before backtracking → ${correct}.`,
  }
}

const DFS_KNOWLEDGE = [
  {
    prompt: 'Which data structure does iterative DFS use?',
    correct: 'Stack (LIFO)',
    distractors: ['Queue (FIFO)', 'Priority queue', 'Hash map'],
    explanation: 'LIFO order ensures we explore deep before broad.',
  },
  {
    prompt: 'Recursive DFS implicitly uses which structure?',
    correct: 'The call stack',
    distractors: ['A global queue', 'A hash set', 'The heap'],
    explanation: 'Each recursive call pushes a frame onto the call stack.',
  },
  {
    prompt: 'Time complexity of DFS on a graph with V vertices and E edges (adjacency list)?',
    correct: 'O(V + E)',
    distractors: ['O(V²)', 'O(V log E)', 'O(E²)'],
    explanation: 'Each vertex and edge is visited at most a constant number of times.',
  },
  {
    prompt: 'Which classic problem is typically solved with DFS?',
    correct: 'Topological sort of a DAG',
    distractors: [
      'Shortest path in unweighted graphs',
      'Finding the median',
      'K-way merge',
    ],
    explanation: 'Post-order DFS yields a valid topological ordering.',
  },
  {
    prompt: 'What is a "back edge" in DFS?',
    correct: 'An edge to an ancestor in the DFS tree (indicates a cycle)',
    distractors: [
      'An edge to a descendant',
      'An edge to a sibling subtree',
      'An edge that isn\'t traversed',
    ],
    explanation: 'Back edges connect to ancestors on the current DFS path — their presence means a cycle.',
  },
]

function makeDFSQuestion() {
  const templates = [
    dfsNextVisitTemplate,
    dfsNextVisitTemplate,
    dfsVisitOrderTemplate,
    () => fromKnowledge('DFS', DFS_KNOWLEDGE[randomInt(0, DFS_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// DP - Fibonacci
// ==========================================================================

function fibonacciValueTemplate() {
  const n = randomInt(5, 12)
  const fib = [0, 1]
  for (let i = 2; i <= n; i++) fib.push(fib[i - 1] + fib[i - 2])
  const correct = String(fib[n])
  const distractors = [
    String(fib[n - 1]),
    String(fib[n - 1] + fib[n - 1]),
    String(fib[n] + fib[n - 2]),
  ].filter((d, i, a) => a.indexOf(d) === i && d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Fibonacci DP',
    prompt: `Bottom-up DP with dp[0]=0, dp[1]=1, dp[i]=dp[i-1]+dp[i-2]. What is dp[${n}]?`,
    choices,
    correctIndex,
    explanation: `Filling the table: ${fib.slice(0, n + 1).join(', ')}. So dp[${n}] = ${fib[n]}.`,
  }
}

const FIB_KNOWLEDGE = [
  {
    prompt: 'Time complexity of the naive recursive Fibonacci (no memoization)?',
    correct: 'O(2ⁿ)',
    distractors: ['O(n)', 'O(n²)', 'O(log n)'],
    explanation: 'Each call spawns two sub-calls — the recursion tree has ~2ⁿ nodes.',
  },
  {
    prompt: 'Time complexity of bottom-up Fibonacci with a table?',
    correct: 'O(n)',
    distractors: ['O(2ⁿ)', 'O(n log n)', 'O(log n)'],
    explanation: 'One pass filling n cells, each O(1).',
  },
  {
    prompt: 'Can Fibonacci be computed in O(log n) time?',
    correct: 'Yes — using matrix exponentiation',
    distractors: ['No, never', 'Only for small n', 'Yes — with memoization'],
    explanation: 'Raising the 2×2 matrix [[1,1],[1,0]] to the n-th power via fast exponentiation gives O(log n).',
  },
  {
    prompt: 'Minimum extra space required to compute F(n) iteratively?',
    correct: 'O(1)',
    distractors: ['O(n)', 'O(log n)', 'O(n²)'],
    explanation: 'Only two previous values are needed at any moment.',
  },
  {
    prompt: 'Top-down vs bottom-up DP — which does memoization represent?',
    correct: 'Top-down (recursion + caching)',
    distractors: [
      'Bottom-up (iterative table fill)',
      'Neither',
      'Both equally',
    ],
    explanation: 'Memoization caches results of recursive calls — classic top-down.',
  },
]

function makeFibonacciQuestion() {
  const templates = [
    fibonacciValueTemplate,
    fibonacciValueTemplate,
    () => fromKnowledge('Fibonacci DP', FIB_KNOWLEDGE[randomInt(0, FIB_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// DP - Knapsack
// ==========================================================================

function knapsackComputedTemplate() {
  const items = [
    { w: 2, v: 3 },
    { w: 3, v: 4 },
    { w: 4, v: 5 },
    { w: 5, v: 6 },
  ]
  const pool = shuffle(items).slice(0, randomInt(3, 4))
  const W = randomInt(5, 8)

  const n = pool.length
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i - 1][w]
      if (pool[i - 1].w <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - pool[i - 1].w] + pool[i - 1].v)
      }
    }
  }
  const answer = dp[n][W]
  const correct = String(answer)
  const distractors = [
    String(answer + 1),
    String(Math.max(0, answer - 1)),
    String(pool.reduce((s, it) => s + it.v, 0)),
  ].filter((d, i, a) => a.indexOf(d) === i && d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)
  const itemsStr = pool.map((it) => `(w=${it.w}, v=${it.v})`).join(', ')
  return {
    category: '0/1 Knapsack',
    prompt: `0/1 Knapsack with items ${itemsStr} and capacity W=${W}. What is the maximum total value?`,
    choices,
    correctIndex,
    explanation: `Filling the DP table yields dp[n][W] = ${answer}.`,
  }
}

const KNAPSACK_KNOWLEDGE = [
  {
    prompt: '0/1 Knapsack recurrence: for item i with weight w_i, value v_i, if w_i ≤ w, then dp[i][w] = ?',
    correct: 'max(dp[i-1][w], dp[i-1][w - w_i] + v_i)',
    distractors: [
      'dp[i-1][w] + v_i',
      'min(dp[i-1][w], dp[i-1][w - w_i] + v_i)',
      'dp[i-1][w - w_i] + v_i',
    ],
    explanation: 'Either skip (dp[i-1][w]) or take (dp[i-1][w - w_i] + v_i) — take the max.',
  },
  {
    prompt: '0/1 Knapsack: what is dp[i][w] when w_i > w (item is too heavy)?',
    correct: 'dp[i-1][w]',
    distractors: ['0', 'dp[i-1][w-1]', 'dp[i][w-1]'],
    explanation: 'Item can\'t fit — the best is what we had with the first i-1 items.',
  },
  {
    prompt: 'Time complexity of the classic 0/1 Knapsack DP with n items and capacity W?',
    correct: 'O(n·W)',
    distractors: ['O(n log W)', 'O(n²)', 'O(2ⁿ)'],
    explanation: 'We fill an n × W table with O(1) work per cell.',
  },
  {
    prompt: 'What does dp[i][w] represent in 0/1 Knapsack?',
    correct: 'Max value using the first i items with capacity w',
    distractors: [
      'Min weight to reach value i with capacity w',
      'Number of items picked',
      'Maximum item index used',
    ],
    explanation: 'Standard definition — value of the sub-problem over prefix of items × capacity.',
  },
  {
    prompt: 'Base case dp[0][w] for any capacity w?',
    correct: '0',
    distractors: ['w', '1', 'Undefined'],
    explanation: 'No items → no value, regardless of capacity.',
  },
  {
    prompt: 'Is 0/1 Knapsack considered weakly NP-hard or strongly NP-hard?',
    correct: 'Weakly NP-hard',
    distractors: [
      'Strongly NP-hard',
      'In P',
      'Undecidable',
    ],
    explanation: 'Pseudo-polynomial O(n·W) exists, so it\'s weakly NP-hard.',
  },
  {
    prompt: 'Can 0/1 Knapsack be solved greedily by taking highest value-to-weight ratio first?',
    correct: 'No — that only works for fractional knapsack',
    distractors: [
      'Yes, always optimal',
      'Only for integer weights',
      'Only for small n',
    ],
    explanation: 'Greedy ratios give the optimum only when items are divisible.',
  },
  {
    prompt: 'Space-optimized 0/1 Knapsack uses how many rows?',
    correct: '1 (using reverse iteration over w)',
    distractors: ['n rows always', '2 rows', 'log n rows'],
    explanation: 'Iterating capacity w from W down to 0 lets a single row stand in for dp[i] and dp[i-1].',
  },
  {
    prompt: 'Unbounded Knapsack (item can be taken multiple times) recurrence when w_i ≤ w?',
    correct: 'max(dp[i-1][w], dp[i][w - w_i] + v_i)',
    distractors: [
      'max(dp[i-1][w], dp[i-1][w - w_i] + v_i)',
      'dp[i-1][w - w_i] + v_i',
      'min over i of dp[i][w]',
    ],
    explanation: 'Using dp[i] (not dp[i-1]) on the take branch allows the same item to be reused.',
  },
  {
    prompt: 'Reconstructing the chosen items in 0/1 Knapsack requires…',
    correct: 'Walking the DP table backwards, comparing dp[i][w] to dp[i-1][w]',
    distractors: [
      'Storing a parent pointer on every cell',
      'Running the algorithm twice',
      'Solving a separate LP',
    ],
    explanation: 'If dp[i][w] != dp[i-1][w] then item i was taken; jump to dp[i-1][w - w_i].',
  },
]

function makeKnapsackQuestion() {
  const templates = [
    knapsackComputedTemplate,
    () => fromKnowledge('0/1 Knapsack', KNAPSACK_KNOWLEDGE[randomInt(0, KNAPSACK_KNOWLEDGE.length - 1)]),
    () => fromKnowledge('0/1 Knapsack', KNAPSACK_KNOWLEDGE[randomInt(0, KNAPSACK_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// DP - LCS
// ==========================================================================

function lcsLengthTemplate() {
  const pairs = [
    ['ABCBDAB', 'BDCAB', 4],
    ['AGGTAB', 'GXTXAYB', 4],
    ['ABCDGH', 'AEDFHR', 3],
    ['HELLO', 'WORLD', 1],
    ['ABCDE', 'ACE', 3],
    ['XMJYAUZ', 'MZJAWXU', 4],
    ['ABAB', 'BABA', 3],
    ['STONE', 'LONGEST', 3],
  ]
  const [a, b, len] = pairs[randomInt(0, pairs.length - 1)]
  const correct = String(len)
  const distractors = [String(len - 1), String(len + 1), String(Math.min(a.length, b.length))]
    .filter((d, i, arr) => arr.indexOf(d) === i && d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'LCS',
    prompt: `What is the length of the Longest Common Subsequence of "${a}" and "${b}"?`,
    choices,
    correctIndex,
    explanation: `LCS("${a}", "${b}") has length ${len}.`,
  }
}

const LCS_KNOWLEDGE = [
  {
    prompt: 'LCS DP: if s1[i-1] === s2[j-1], what is dp[i][j]?',
    correct: 'dp[i-1][j-1] + 1',
    distractors: [
      'max(dp[i-1][j], dp[i][j-1])',
      'dp[i-1][j-1]',
      '1 + dp[i][j-1]',
    ],
    explanation: 'A match extends the previous diagonal LCS by one.',
  },
  {
    prompt: 'LCS DP: if s1[i-1] !== s2[j-1], what is dp[i][j]?',
    correct: 'max(dp[i-1][j], dp[i][j-1])',
    distractors: ['dp[i-1][j-1] + 1', 'dp[i-1][j-1]', '0'],
    explanation: 'Drop one character from either string and take the better result.',
  },
  {
    prompt: 'Time complexity of classic LCS DP on strings of length m and n?',
    correct: 'O(m·n)',
    distractors: ['O(m + n)', 'O(min(m,n))', 'O(2^max(m,n))'],
    explanation: 'One cell per (i, j) pair, each O(1).',
  },
  {
    prompt: 'Space complexity of the classic LCS DP?',
    correct: 'O(m·n)',
    distractors: ['O(m + n)', 'O(1)', 'O(log(m·n))'],
    explanation: 'Full 2D table of size (m+1) × (n+1).',
  },
  {
    prompt: 'Space can be reduced from O(m·n) to…',
    correct: 'O(min(m, n)) using two rolling rows',
    distractors: ['O(1)', 'O(log mn)', 'Not possible'],
    explanation: 'Each dp[i][j] depends only on the previous row and current row — keep just two.',
  },
  {
    prompt: 'LCS differs from Longest Common Substring because…',
    correct: 'LCS characters need not be contiguous; substring must be',
    distractors: [
      'They are the same problem',
      'LCS is always shorter',
      'Substring uses a different alphabet',
    ],
    explanation: 'Subsequence preserves order but allows gaps; substring is a contiguous slice.',
  },
  {
    prompt: 'What is LCS("ABCD", "ACBD")?',
    correct: '3 (e.g. "ABD" or "ACD")',
    distractors: ['2', '4', '1'],
    explanation: 'Two valid LCSs of length 3 exist: ABD and ACD.',
  },
  {
    prompt: 'Can LCS be reconstructed (not just its length) from the DP table?',
    correct: 'Yes, by backtracking from dp[m][n]',
    distractors: [
      'No, only the length is recoverable',
      'Only if strings are equal',
      'Only with a second DP pass',
    ],
    explanation: 'Walk backwards, prepending matched chars and moving diagonally on match.',
  },
  {
    prompt: 'LCS of two identical strings of length n?',
    correct: 'n',
    distractors: ['n - 1', '1', '2n'],
    explanation: 'The whole string is the LCS.',
  },
  {
    prompt: 'LCS of any string with the empty string?',
    correct: '0',
    distractors: ['1', 'Length of the non-empty string', 'Undefined'],
    explanation: 'No characters to match.',
  },
]

function makeLCSQuestion() {
  const templates = [
    lcsLengthTemplate,
    () => fromKnowledge('LCS', LCS_KNOWLEDGE[randomInt(0, LCS_KNOWLEDGE.length - 1)]),
    () => fromKnowledge('LCS', LCS_KNOWLEDGE[randomInt(0, LCS_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// LINKED LIST - Singly
// ==========================================================================

function singlyInsertHeadTemplate() {
  const list = randomArray(4, 1, 30)
  const newVal = randomInt(40, 99)
  const correct = [newVal, ...list].join(' → ')
  const distractors = [
    [...list, newVal].join(' → '),
    list.join(' → '),
    [newVal, list[list.length - 1]].join(' → '),
  ]
  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Singly Linked List',
    prompt: `Given the list ${list.join(' → ')}, what is the list after insertHead(${newVal})?`,
    choices,
    correctIndex,
    explanation: `insertHead prepends — the new node's next points to the old head.`,
  }
}

function singlyInsertTailTemplate() {
  const list = randomArray(4, 1, 30)
  const newVal = randomInt(40, 99)
  const correct = [...list, newVal].join(' → ')
  const distractors = [
    [newVal, ...list].join(' → '),
    list.join(' → '),
    [list[0], newVal].join(' → '),
  ]
  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Singly Linked List',
    prompt: `Given the list ${list.join(' → ')}, what is the list after insertTail(${newVal})?`,
    choices,
    correctIndex,
    explanation: `insertTail walks to the final node and links the new node after it.`,
  }
}

function singlyDeleteHeadTemplate() {
  const list = randomArray(4, 1, 30)
  const correct = list.slice(1).join(' → ')
  const distractors = [
    list.slice(0, -1).join(' → '),
    list.join(' → '),
    list.slice(2).join(' → ') || '(empty)',
  ]
  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Singly Linked List',
    prompt: `Given the list ${list.join(' → ')}, what is the list after deleteHead()?`,
    choices,
    correctIndex,
    explanation: `deleteHead advances head = head.next — O(1), drops the first node.`,
  }
}

function singlyInsertAtTemplate() {
  const list = randomArray(5, 1, 30)
  const pos = randomInt(1, list.length - 1)
  const newVal = randomInt(40, 99)
  const result = [...list.slice(0, pos), newVal, ...list.slice(pos)]
  const correct = result.join(' → ')
  const distractors = [
    [...list.slice(0, pos - 1), newVal, ...list.slice(pos - 1)].join(' → '),
    [...list.slice(0, pos + 1), newVal, ...list.slice(pos + 1)].join(' → '),
    list.join(' → '),
  ].filter((d) => d !== correct)
  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Singly Linked List',
    prompt: `Given the list ${list.join(' → ')}, what is the list after insertAt(index=${pos}, value=${newVal})?`,
    choices,
    correctIndex,
    explanation: `insertAt walks ${pos} node${pos === 1 ? '' : 's'} from head and splices in the new node.`,
  }
}

const SINGLY_KNOWLEDGE = [
  {
    prompt: 'Time complexity of searching for a value in a singly linked list of n nodes?',
    correct: 'O(n)',
    distractors: ['O(1)', 'O(log n)', 'O(n log n)'],
    explanation: 'Must walk the list — no random access.',
  },
  {
    prompt: 'Reversing a singly linked list of n nodes iteratively uses what space?',
    correct: 'O(1)',
    distractors: ['O(n)', 'O(log n)', 'O(n²)'],
    explanation: 'Three pointers — prev, curr, next — are enough.',
  },
  {
    prompt: 'How do you find the middle node of a singly linked list in one pass?',
    correct: 'Two pointers: slow advances 1, fast advances 2',
    distractors: [
      'Count length first, then walk n/2',
      'Copy to array and index',
      'Use binary search',
    ],
    explanation: 'When fast reaches the end, slow is at the middle — O(n) time, O(1) space.',
  },
  {
    prompt: 'Deleting the tail of a singly linked list (no tail pointer) is…',
    correct: 'O(n)',
    distractors: ['O(1)', 'O(log n)', 'Impossible'],
    explanation: 'Must walk from head to find the second-to-last node.',
  },
  {
    prompt: 'Which operation is O(1) in a singly linked list given only a head pointer?',
    correct: 'insertHead',
    distractors: ['insertTail', 'deleteTail', 'search'],
    explanation: 'Prepending to the head just updates two pointers.',
  },
  {
    prompt: 'To detect a cycle in a singly linked list in O(1) space, use…',
    correct: "Floyd's tortoise-and-hare algorithm",
    distractors: ['A visited-set hash map', 'Reverse the list', 'Binary search'],
    explanation: 'Two pointers moving at different speeds meet iff a cycle exists.',
  },
]

function makeSinglyLinkedListQuestion() {
  const templates = [
    singlyInsertHeadTemplate,
    singlyInsertTailTemplate,
    singlyDeleteHeadTemplate,
    singlyInsertAtTemplate,
    () => fromKnowledge('Singly Linked List', SINGLY_KNOWLEDGE[randomInt(0, SINGLY_KNOWLEDGE.length - 1)]),
    () => fromKnowledge('Singly Linked List', SINGLY_KNOWLEDGE[randomInt(0, SINGLY_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// LINKED LIST - Doubly
// ==========================================================================

function doublyInsertHeadTemplate() {
  const list = randomArray(4, 1, 30)
  const newVal = randomInt(40, 99)
  const correct = [newVal, ...list].join(' ↔ ')
  const distractors = [
    [...list, newVal].join(' ↔ '),
    list.join(' ↔ '),
    [newVal, list[list.length - 1]].join(' ↔ '),
  ]
  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Doubly Linked List',
    prompt: `Given the doubly linked list ${list.join(' ↔ ')}, what is the list after insertHead(${newVal})?`,
    choices,
    correctIndex,
    explanation: `Update newNode.next = oldHead, oldHead.prev = newNode, head = newNode — O(1).`,
  }
}

function doublyDeleteTailTemplate() {
  const list = randomArray(4, 1, 30)
  const correct = list.slice(0, -1).join(' ↔ ')
  const distractors = [
    list.slice(1).join(' ↔ '),
    list.join(' ↔ '),
    list.slice(0, -2).join(' ↔ ') || '(empty)',
  ]
  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Doubly Linked List',
    prompt: `Given the doubly linked list ${list.join(' ↔ ')} (with a tail pointer), what is the list after deleteTail()?`,
    choices,
    correctIndex,
    explanation: `With a tail pointer, deleteTail is O(1) in a doubly linked list thanks to the prev pointer.`,
  }
}

const DOUBLY_KNOWLEDGE = [
  {
    prompt: 'In a doubly linked list, deleting a middle node X (given a reference to X) requires updating which pointers?',
    correct: 'X.prev.next and X.next.prev',
    distractors: ['Only X.prev.next', 'Only X.next.prev', 'head and tail'],
    explanation: 'Both neighbors must skip over X — X.prev.next = X.next and X.next.prev = X.prev.',
  },
  {
    prompt: 'Time complexity of insertHead in a doubly linked list with a head pointer?',
    correct: 'O(1)',
    distractors: ['O(n)', 'O(log n)', 'O(n log n)'],
    explanation: 'Only a few pointer swaps.',
  },
  {
    prompt: 'What extra pointer does each node in a doubly linked list store compared to a singly linked list?',
    correct: 'prev',
    distractors: ['tail', 'parent', 'random'],
    explanation: 'Each node has both next and prev — O(1) backward traversal.',
  },
  {
    prompt: 'Traversing a doubly linked list of n nodes from tail back to head is…',
    correct: 'O(n)',
    distractors: ['O(1)', 'O(log n)', 'Not possible'],
    explanation: 'Backward traversal via prev pointers is symmetric to forward — linear.',
  },
  {
    prompt: 'Main memory disadvantage of a doubly linked list?',
    correct: 'An extra pointer per node (≈ +8 bytes on 64-bit)',
    distractors: [
      'O(n) extra total memory regardless of n',
      'Cannot be garbage collected',
      'Requires contiguous memory',
    ],
    explanation: 'Every node pays the space cost of the prev pointer.',
  },
  {
    prompt: 'deleteTail in a doubly linked list with a tail pointer is…',
    correct: 'O(1)',
    distractors: ['O(n)', 'O(log n)', 'Impossible'],
    explanation: 'tail.prev gives the new tail in constant time.',
  },
  {
    prompt: 'Reversing a doubly linked list iteratively requires…',
    correct: 'Swapping each node\'s next and prev pointers',
    distractors: [
      'Allocating a new list',
      'Nothing — just flip head and tail pointers',
      'A recursive helper only',
    ],
    explanation: 'After swapping next/prev in every node, flip head and tail.',
  },
  {
    prompt: 'Which data structures are commonly implemented on top of doubly linked lists?',
    correct: 'LRU cache and deque',
    distractors: ['Binary heap', 'Hash table', 'Disjoint set union'],
    explanation: 'O(1) insertion/removal at both ends and middle make DLLs ideal for these.',
  },
  {
    prompt: 'Does a doubly linked list improve asymptotic search time over a singly linked list?',
    correct: 'No — still O(n)',
    distractors: ['Yes, O(log n)', 'Yes, O(1)', 'Only for sorted data'],
    explanation: 'Extra pointer helps with deletion/backward traversal, not random access.',
  },
  {
    prompt: 'Sentinel (dummy) head/tail nodes in a doubly linked list simplify…',
    correct: 'Edge cases in insertion and deletion code',
    distractors: [
      'Memory usage (they make it smaller)',
      'Cache locality',
      'Nothing — they are just optional',
    ],
    explanation: 'Sentinels remove null checks and unify the head/tail/middle cases.',
  },
]

function makeDoublyLinkedListQuestion() {
  const templates = [
    doublyInsertHeadTemplate,
    doublyDeleteTailTemplate,
    () => fromKnowledge('Doubly Linked List', DOUBLY_KNOWLEDGE[randomInt(0, DOUBLY_KNOWLEDGE.length - 1)]),
    () => fromKnowledge('Doubly Linked List', DOUBLY_KNOWLEDGE[randomInt(0, DOUBLY_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// LINKED LIST - Circular
// ==========================================================================

const CIRCULAR_KNOWLEDGE = [
  {
    prompt: 'In a circular singly linked list, the tail node\'s next pointer references…',
    correct: 'The head node',
    distractors: ['null', 'Itself', 'The previous node'],
    explanation: 'That\'s the defining property — tail.next === head.',
  },
  {
    prompt: 'Which classic algorithm detects a cycle in a linked list in O(n) time, O(1) space?',
    correct: "Floyd's tortoise and hare",
    distractors: ['Binary search', 'DFS with a visited set', 'Kruskal\'s algorithm'],
    explanation: 'Two pointers moving at different speeds meet iff a cycle exists.',
  },
  {
    prompt: 'Naive traversal of a circular list with `while (node !== null)` will…',
    correct: 'Loop forever',
    distractors: [
      'Skip the head',
      'Visit each node twice',
      'Throw a null pointer error',
    ],
    explanation: 'There is no null terminator — use `do { ... } while (node !== head)` or bound iterations.',
  },
  {
    prompt: 'How do you append to a circular singly linked list with only a tail pointer, in O(1)?',
    correct: 'Insert new node after tail, update tail to new node (keep new.next = head)',
    distractors: [
      'Walk to the head and insert before it',
      'Rebuild the list',
      'Not possible in O(1)',
    ],
    explanation: 'tail.next is head — stitch in the new node and advance tail in O(1).',
  },
  {
    prompt: 'The Josephus problem is naturally modelled using…',
    correct: 'A circular linked list',
    distractors: ['A binary heap', 'A stack', 'A doubly linked list only'],
    explanation: 'Participants in a circle repeatedly eliminate every k-th member — classic circular-list use case.',
  },
  {
    prompt: 'A practical use case for a circular linked list is…',
    correct: 'Round-robin CPU scheduling',
    distractors: [
      'Binary search tree traversal',
      'Hash table collision handling',
      'Dijkstra\'s algorithm priority queue',
    ],
    explanation: 'Circular structure lets the scheduler cycle through processes indefinitely.',
  },
  {
    prompt: 'How many node pointers must change to delete the head of a circular singly linked list?',
    correct: 'Two (tail.next and head)',
    distractors: ['One (just head)', 'Three', 'Depends on list length'],
    explanation: 'tail.next must be updated to the new head, and head itself.',
  },
  {
    prompt: 'In a circular doubly linked list, how do you access the tail from head in O(1)?',
    correct: 'Follow head.prev',
    distractors: [
      'Walk the list',
      'Impossible without a tail pointer',
      'Use a hash lookup',
    ],
    explanation: 'In a circular DLL, head.prev points directly to the tail.',
  },
]

function makeCircularLinkedListQuestion() {
  return fromKnowledge(
    'Circular Linked List',
    CIRCULAR_KNOWLEDGE[randomInt(0, CIRCULAR_KNOWLEDGE.length - 1)]
  )
}

// ==========================================================================
// TREES
// ==========================================================================

function buildBST(values) {
  const insert = (node, v) => {
    if (!node) return { val: v, left: null, right: null }
    if (v < node.val) node.left = insert(node.left, v)
    else if (v > node.val) node.right = insert(node.right, v)
    return node
  }
  let root = null
  for (const v of values) root = insert(root, v)
  return root
}

function bstInsertComparisonsTemplate() {
  const candidates = [3, 5, 7, 10, 12, 15, 18, 20, 25]
  const values = shuffle(candidates).slice(0, randomInt(5, 7))
  const root = buildBST(values)

  let newVal
  let attempts = 0
  do {
    newVal = randomInt(1, 30)
    attempts++
  } while (values.includes(newVal) && attempts < 20)

  const path = []
  let cur = root
  while (cur) {
    path.push(cur.val)
    if (newVal < cur.val) cur = cur.left
    else cur = cur.right
  }
  const count = path.length

  const correct = String(count)
  const distractors = [
    String(Math.max(1, count - 1)),
    String(count + 1),
    String(values.length),
  ].filter((d, i, a) => a.indexOf(d) === i && d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'BST Insert',
    prompt: `A BST is built by inserting [${values.join(', ')}] in order. To insert ${newVal}, how many node comparisons are made before placing it?`,
    choices,
    correctIndex,
    explanation: `Path of comparisons: ${path.join(' → ')} (${count} comparisons total).`,
  }
}

function bstRootTemplate() {
  const candidates = [3, 5, 7, 10, 12, 15, 18, 20, 25]
  const values = shuffle(candidates).slice(0, randomInt(5, 7))
  const correct = String(values[0])
  const distractors = [
    String(values[values.length - 1]),
    String(Math.min(...values)),
    String(Math.max(...values)),
  ].filter((d, i, a) => a.indexOf(d) === i && d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'BST Insert',
    prompt: `A BST is built by inserting [${values.join(', ')}] in order. What value is at the root?`,
    choices,
    correctIndex,
    explanation: `The first inserted value becomes the root. Here that's ${values[0]}.`,
  }
}

const BST_KNOWLEDGE = [
  {
    prompt: 'Worst-case time to insert a value into an unbalanced BST of n nodes?',
    correct: 'O(n)',
    distractors: ['O(log n)', 'O(1)', 'O(n log n)'],
    explanation: 'A skewed BST degenerates into a linked list.',
  },
  {
    prompt: 'Average-case time to insert into a BST built from random values?',
    correct: 'O(log n)',
    distractors: ['O(n)', 'O(1)', 'O(n log n)'],
    explanation: 'Expected tree height is O(log n) for random insertions.',
  },
  {
    prompt: 'Which property defines a BST?',
    correct: 'For every node: left subtree < node < right subtree',
    distractors: [
      'Every node has ≤ 2 children',
      'Left subtree sum < right subtree sum',
      'Every level is completely filled',
    ],
    explanation: 'The key-ordering invariant is what distinguishes a BST from a generic binary tree.',
  },
  {
    prompt: 'Inorder traversal of a BST produces…',
    correct: 'Values in ascending sorted order',
    distractors: ['Values in insertion order', 'Values in descending order', 'Level-order'],
    explanation: 'Inorder visits left → node → right, matching the BST ordering invariant.',
  },
  {
    prompt: 'To keep BST operations O(log n), use a…',
    correct: 'Self-balancing variant (AVL, Red-Black, etc.)',
    distractors: [
      'Hash table wrapper',
      'Sorted array',
      'Circular list',
    ],
    explanation: 'Self-balancing trees maintain O(log n) height after inserts and deletes.',
  },
]

function makeBSTInsertQuestion() {
  const templates = [
    bstInsertComparisonsTemplate,
    bstInsertComparisonsTemplate,
    bstRootTemplate,
    () => fromKnowledge('BST', BST_KNOWLEDGE[randomInt(0, BST_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

function traversalOutputTemplate() {
  const candidates = [3, 5, 7, 10, 12, 15, 18, 20, 25]
  const values = shuffle(candidates).slice(0, randomInt(5, 7))
  const root = buildBST(values)

  const inorder = []
  const preorder = []
  const postorder = []
  const doIn = (n) => {
    if (!n) return
    doIn(n.left)
    inorder.push(n.val)
    doIn(n.right)
  }
  const doPre = (n) => {
    if (!n) return
    preorder.push(n.val)
    doPre(n.left)
    doPre(n.right)
  }
  const doPost = (n) => {
    if (!n) return
    doPost(n.left)
    doPost(n.right)
    postorder.push(n.val)
  }
  doIn(root)
  doPre(root)
  doPost(root)

  const idx = randomInt(0, 2)
  const names = ['inorder', 'preorder', 'postorder']
  const outputs = [inorder, preorder, postorder]
  const which = names[idx]
  const correct = outputs[idx].join(', ')
  const others = outputs.filter((_, i) => i !== idx).map((a) => a.join(', '))
  const distractors = [
    ...others,
    [...outputs[idx]].reverse().join(', '),
  ]

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Traversals',
    prompt: `A BST is built by inserting [${values.join(', ')}] in order. What is the ${which} traversal?`,
    choices,
    correctIndex,
    explanation:
      which === 'inorder'
        ? `Inorder of a BST is always sorted ascending: ${correct}.`
        : `${which}: ${correct}.`,
  }
}

const TRAVERSAL_KNOWLEDGE = [
  {
    prompt: 'Level-order traversal (BFS on a tree) uses which data structure?',
    correct: 'Queue',
    distractors: ['Stack', 'Priority queue', 'Hash map'],
    explanation: 'FIFO ensures we finish each level before descending.',
  },
  {
    prompt: 'Which traversal of a BST yields values in sorted ascending order?',
    correct: 'Inorder',
    distractors: ['Preorder', 'Postorder', 'Level-order'],
    explanation: 'Inorder visits left → node → right — matches BST ordering.',
  },
  {
    prompt: 'To reconstruct a binary tree uniquely, which pair of traversals suffices?',
    correct: 'Inorder + Preorder (or Inorder + Postorder)',
    distractors: [
      'Preorder + Postorder',
      'Level-order alone',
      'Postorder alone',
    ],
    explanation: 'Inorder is needed to split left/right; pair it with pre or post to locate the root.',
  },
  {
    prompt: 'Postorder traversal order at a node?',
    correct: 'Left, Right, Node',
    distractors: ['Node, Left, Right', 'Left, Node, Right', 'Right, Node, Left'],
    explanation: 'Postorder defers the node itself until both subtrees are done.',
  },
  {
    prompt: 'Morris traversal achieves inorder with what space complexity?',
    correct: 'O(1)',
    distractors: ['O(n)', 'O(log n)', 'O(n log n)'],
    explanation: 'It reuses null right pointers as threads, avoiding a stack or recursion.',
  },
  {
    prompt: 'Time complexity of any of the 4 standard tree traversals?',
    correct: 'O(n)',
    distractors: ['O(log n)', 'O(n log n)', 'O(n²)'],
    explanation: 'Each node is visited exactly once.',
  },
]

function makeTraversalQuestion() {
  const templates = [
    traversalOutputTemplate,
    traversalOutputTemplate,
    () => fromKnowledge('Traversals', TRAVERSAL_KNOWLEDGE[randomInt(0, TRAVERSAL_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// STRINGS - Palindrome
// ==========================================================================

function palindromeWordTemplate() {
  const words = [
    'racecar',
    'hello',
    'level',
    'world',
    'madam',
    'noon',
    'python',
    'stats',
    'civic',
    'table',
    'rotor',
    'refer',
    'apple',
    'kayak',
    'radar',
    'banana',
    'tenet',
    'mango',
    'deified',
    'literal',
  ]
  const s = words[randomInt(0, words.length - 1)]
  const reversed = s.split('').reverse().join('')
  const isPal = s === reversed
  const correct = isPal ? 'Yes' : 'No'
  const distractors = [
    isPal ? 'No' : 'Yes',
    'Only if case-insensitive',
    'Depends on length',
  ]
  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Palindrome',
    prompt: `Is "${s}" a palindrome?`,
    choices,
    correctIndex,
    explanation: isPal
      ? `"${s}" reversed is "${reversed}" — same, so it's a palindrome.`
      : `"${s}" reversed is "${reversed}" — not a palindrome.`,
  }
}

function palindromeCountTemplate() {
  const cases = [
    { s: 'aba', count: 4, note: 'a, b, a, aba' },
    { s: 'abc', count: 3, note: 'a, b, c' },
    { s: 'abba', count: 6, note: 'a, b, b, a, bb, abba' },
    { s: 'aaaa', count: 10, note: 'a×4 + aa×3 + aaa×2 + aaaa×1' },
    { s: 'abab', count: 5, note: 'a, b, a, b, aba, bab → 6. (counted without overlap it\'s 6)' },
  ]
  const valid = cases.filter((c) => c.count !== 5)
  const pick = valid[randomInt(0, valid.length - 1)]
  const correct = String(pick.count)
  const distractors = [
    String(pick.count - 1),
    String(pick.count + 1),
    String(pick.s.length),
  ].filter((d, i, a) => a.indexOf(d) === i && d !== correct)

  const { choices, correctIndex } = makeChoices(correct, distractors)
  return {
    category: 'Palindrome',
    prompt: `How many palindromic substrings (counting duplicates at different positions) does "${pick.s}" contain?`,
    choices,
    correctIndex,
    explanation: pick.note,
  }
}

const PALINDROME_KNOWLEDGE = [
  {
    prompt: 'Time complexity of the two-pointer palindrome check?',
    correct: 'O(n)',
    distractors: ['O(n²)', 'O(log n)', 'O(1)'],
    explanation: 'One pointer from each end converging in the middle.',
  },
  {
    prompt: 'Which algorithm finds the longest palindromic substring in O(n)?',
    correct: "Manacher's algorithm",
    distractors: ['KMP', 'Rabin-Karp', 'Knuth-Morris-Pratt variant'],
    explanation: 'Manacher\'s uses palindrome radii symmetry to achieve linear time.',
  },
  {
    prompt: 'Time complexity of the classic "expand around center" approach for longest palindromic substring?',
    correct: 'O(n²)',
    distractors: ['O(n log n)', 'O(n)', 'O(n³)'],
    explanation: '2n-1 centers × O(n) expansion each.',
  },
  {
    prompt: 'Is the empty string considered a palindrome?',
    correct: 'Yes',
    distractors: ['No', 'Only by convention in some texts', 'Undefined'],
    explanation: 'A string of length 0 trivially equals its reverse.',
  },
  {
    prompt: 'Is "A man a plan a canal Panama" a palindrome (ignoring spaces and case)?',
    correct: 'Yes',
    distractors: ['No', 'Only with punctuation preserved', 'Depends on locale'],
    explanation: 'Stripping spaces and lowercasing yields "amanaplanacanalpanama" — a palindrome.',
  },
  {
    prompt: 'DP approach for longest palindromic subsequence reduces to…',
    correct: 'LCS(s, reverse(s))',
    distractors: [
      'Plain KMP',
      'Binary search on answers',
      'Suffix array',
    ],
    explanation: 'The LPS of s equals the LCS of s with its reverse.',
  },
]

function makePalindromeQuestion() {
  const templates = [
    palindromeWordTemplate,
    palindromeWordTemplate,
    palindromeCountTemplate,
    () => fromKnowledge('Palindrome', PALINDROME_KNOWLEDGE[randomInt(0, PALINDROME_KNOWLEDGE.length - 1)]),
  ]
  return pickTemplate(templates)
}

// ==========================================================================
// STRINGS - Pattern Matching
// ==========================================================================

const PATTERN_KNOWLEDGE = [
  {
    prompt: 'Worst-case time complexity of naive string matching (text n, pattern m)?',
    correct: 'O(n·m)',
    distractors: ['O(n + m)', 'O(n log m)', 'O(m)'],
    explanation: 'At every text offset we may re-compare all m pattern characters.',
  },
  {
    prompt: 'Which algorithm uses a failure function (longest proper prefix = suffix) to avoid rescans?',
    correct: 'KMP',
    distractors: ['Rabin-Karp', 'Boyer-Moore', 'Z-algorithm'],
    explanation: 'KMP precomputes the LPS table and never rewinds the text pointer.',
  },
  {
    prompt: 'Which algorithm uses rolling hashes to compare text windows to the pattern?',
    correct: 'Rabin-Karp',
    distractors: ['KMP', 'Boyer-Moore', 'Naive'],
    explanation: 'Rabin-Karp slides a constant-time hash over each window.',
  },
  {
    prompt: 'Boyer-Moore is fast in practice because it…',
    correct: 'Skips characters using bad-character and good-suffix rules',
    distractors: [
      'Hashes the pattern',
      'Uses a suffix automaton',
      'Sorts the pattern',
    ],
    explanation: 'Scanning right-to-left with skip heuristics can jump past many characters on each mismatch.',
  },
  {
    prompt: 'KMP preprocessing (building the LPS array) runs in…',
    correct: 'O(m)',
    distractors: ['O(n)', 'O(m²)', 'O(n·m)'],
    explanation: 'Single linear scan over the pattern.',
  },
  {
    prompt: 'Rabin-Karp has what average-case time over a large text and small pattern?',
    correct: 'O(n + m)',
    distractors: ['O(n·m)', 'O(log n)', 'O(m²)'],
    explanation: 'Rolling hash gives O(1) per window on average; worst case is O(n·m) due to hash collisions.',
  },
  {
    prompt: 'Which algorithm is designed to find all matches of multiple patterns in one pass?',
    correct: 'Aho-Corasick',
    distractors: ['KMP', 'Boyer-Moore', 'Rabin-Karp (single string only)'],
    explanation: 'Aho-Corasick builds a trie with failure links — linear in total output.',
  },
  {
    prompt: 'For the pattern "ABABAB", the longest proper prefix that is also a suffix has length…',
    correct: '4',
    distractors: ['2', '3', '6'],
    explanation: 'LPS = "ABAB" of length 4.',
  },
  {
    prompt: 'Z-algorithm computes, for each position i, the length of the longest substring starting at i that matches…',
    correct: 'A prefix of the string',
    distractors: [
      'The suffix ending at i',
      'A palindrome centered at i',
      'The last matched occurrence',
    ],
    explanation: 'Z[i] = length of longest substring starting at i that also is a prefix.',
  },
  {
    prompt: 'For pattern length m = 1, naive matching has time complexity…',
    correct: 'O(n)',
    distractors: ['O(n·m) = O(n)', 'O(log n)', 'O(1)'],
    explanation: 'With m=1 it\'s one character comparison per text position — O(n).',
  },
]

function makePatternMatchingQuestion() {
  return fromKnowledge(
    'Pattern Matching',
    PATTERN_KNOWLEDGE[randomInt(0, PATTERN_KNOWLEDGE.length - 1)]
  )
}

// ==========================================================================
// TOPIC REGISTRY
// ==========================================================================

export const TOPICS = [
  {
    id: 'sorting',
    label: 'Sorting',
    iconName: 'ArrowUpDown',
    accent: 'purple',
    description: 'Arrange elements using compare-and-swap strategies.',
    subtopics: [
      { id: 'bubble', label: 'Bubble Sort', generator: makeBubbleSortQuestion },
      { id: 'selection', label: 'Selection Sort', generator: makeSelectionSortQuestion },
      { id: 'insertion', label: 'Insertion Sort', generator: makeInsertionSortQuestion },
      { id: 'merge', label: 'Merge Sort', generator: makeMergeSortQuestion },
      { id: 'quick', label: 'Quick Sort', generator: makeQuickSortQuestion },
    ],
  },
  {
    id: 'dp',
    label: 'Dynamic Programming',
    iconName: 'LayoutGrid',
    accent: 'blue',
    description: 'Build solutions by composing overlapping subproblems.',
    subtopics: [
      { id: 'knapsack', label: 'Knapsack', generator: makeKnapsackQuestion },
      { id: 'lcs', label: 'Longest Common Subsequence', generator: makeLCSQuestion },
      { id: 'fibonacci', label: 'Fibonacci DP', generator: makeFibonacciQuestion },
    ],
  },
  {
    id: 'linked-list',
    label: 'Linked List',
    iconName: 'Link2',
    accent: 'rose',
    description: 'Pointer-based sequential structures.',
    subtopics: [
      { id: 'singly', label: 'Singly Linked List', generator: makeSinglyLinkedListQuestion },
      { id: 'doubly', label: 'Doubly Linked List', generator: makeDoublyLinkedListQuestion },
      { id: 'circular', label: 'Circular Linked List', generator: makeCircularLinkedListQuestion },
    ],
  },
  {
    id: 'trees',
    label: 'Trees',
    iconName: 'GitBranch',
    accent: 'green',
    description: 'Hierarchical structures, BSTs and traversals.',
    subtopics: [
      { id: 'bst-insert', label: 'BST Insert', generator: makeBSTInsertQuestion },
      { id: 'traversal', label: 'Traversals', generator: makeTraversalQuestion },
    ],
  },
  {
    id: 'graphs',
    label: 'Graphs',
    iconName: 'Share2',
    accent: 'amber',
    description: 'Nodes and edges — traversals and search strategies.',
    subtopics: [
      { id: 'bfs', label: 'BFS', generator: makeBFSQuestion },
      { id: 'dfs', label: 'DFS', generator: makeDFSQuestion },
    ],
  },
  {
    id: 'arrays',
    label: 'Arrays',
    iconName: 'AlignJustify',
    accent: 'cyan',
    description: 'Linear, random-access sequences.',
    subtopics: [
      { id: 'linear-search', label: 'Linear Search', generator: makeLinearSearchQuestion },
      { id: 'binary-search', label: 'Binary Search', generator: makeBinarySearchQuestion },
    ],
  },
  {
    id: 'strings',
    label: 'Strings',
    iconName: 'Type',
    accent: 'rose',
    description: 'Character sequences and pattern matching.',
    subtopics: [
      { id: 'palindrome', label: 'Palindrome', generator: makePalindromeQuestion },
      { id: 'pattern-matching', label: 'Pattern Matching', generator: makePatternMatchingQuestion },
    ],
  },
]

export function findTopic(topicId) {
  return TOPICS.find((t) => t.id === topicId) || null
}

export function findSubtopic(topicId, subtopicId) {
  const t = findTopic(topicId)
  if (!t) return null
  return t.subtopics.find((s) => s.id === subtopicId) || null
}

// De-duplicate questions within a single quiz by prompt — we have enough
// templates now that 10 distinct questions should nearly always be possible.
export function generateQuiz(topicId, subtopicId, count = 10) {
  const sub = findSubtopic(topicId, subtopicId)
  if (!sub) return []
  const questions = []
  const seenPrompts = new Set()
  let attempts = 0
  while (questions.length < count && attempts < count * 20) {
    attempts++
    try {
      const q = sub.generator()
      if (!q) continue
      if (seenPrompts.has(q.prompt)) continue
      seenPrompts.add(q.prompt)
      questions.push(q)
    } catch {
      // swallow generator failures and retry
    }
  }
  // If dedup couldn't hit `count`, fall back to allowing repeats so the quiz still runs
  if (questions.length < count) {
    while (questions.length < count) {
      try {
        const q = sub.generator()
        if (q) questions.push(q)
      } catch {
        break
      }
    }
  }
  return questions
}

// ==========================================================================
// HIGH SCORES (per topic/subtopic)
// ==========================================================================

export function highScoreKey(topicId, subtopicId) {
  return `dsa-visual:quiz-high-score:${topicId}:${subtopicId}`
}

export function loadHighScore(topicId, subtopicId) {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(highScoreKey(topicId, subtopicId))
    const n = parseInt(raw, 10)
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

export function saveHighScore(topicId, subtopicId, score) {
  if (typeof window === 'undefined') return
  try {
    const current = loadHighScore(topicId, subtopicId)
    if (score > current) {
      localStorage.setItem(highScoreKey(topicId, subtopicId), String(score))
    }
  } catch {
    // ignore
  }
}
