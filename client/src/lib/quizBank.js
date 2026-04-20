import bubbleSort from '../visualizers/sorting/algorithms/bubbleSort.js'
import binarySearch from '../visualizers/searching/algorithms/binarySearch.js'
import bfs from '../visualizers/graph/algorithms/bfs.js'

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

function makeSortingQuestion() {
  const size = randomInt(6, 8)
  const arr = randomArray(size)
  const steps = bubbleSort(arr)
  const compareIndices = []
  for (let i = 0; i < steps.length - 1; i++) {
    if (steps[i].type === 'compare') compareIndices.push(i)
  }
  if (compareIndices.length === 0) return makeSortingQuestion()

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
    category: 'Sorting',
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

function makeBinarySearchQuestion() {
  const size = randomInt(8, 12)
  const arr = randomArray(size).sort((a, b) => a - b)
  const target = arr[randomInt(0, arr.length - 1)]
  const steps = binarySearch(arr, target)
  const compareSteps = steps
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.type === 'compare')
  if (compareSteps.length < 2) return makeBinarySearchQuestion()

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

function makeBFSQuestion() {
  const { nodes, edges } = makeSimpleGraph()
  const steps = bfs(nodes, edges, 0)
  const candidates = []
  for (let i = 0; i < steps.length - 1; i++) {
    const s = steps[i]
    if (s.state && Array.isArray(s.state.queue) && s.state.queue.length >= 2) {
      candidates.push(i)
    }
  }
  if (candidates.length === 0) return makeBFSQuestion()

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
  if (nextVisit === null) return makeBFSQuestion()

  const correct = `Node ${nextVisit}`
  const distractorPool = nodes
    .map((n) => n.id)
    .filter((id) => id !== nextVisit)
    .map((id) => `Node ${id}`)
  const distractors = shuffle(distractorPool).slice(0, 3)
  const { choices, correctIndex } = makeChoices(correct, distractors)

  const adjLines = nodes.map((n) => {
    const neighbors = edges
      .filter((e) => e.source === n.id || e.target === n.id)
      .map((e) => (e.source === n.id ? e.target : e.source))
    return `${n.id} → ${neighbors.join(', ') || '(none)'}`
  })

  return {
    category: 'BFS',
    prompt: `Running BFS from node 0. Queue: [${queue.join(', ')}]. Visited: {${visited.join(', ')}}. Which node is visited next?`,
    adjacency: adjLines,
    choices,
    correctIndex,
    explanation: `BFS dequeues from the front. The next node to dequeue (and visit, if not already visited) is Node ${nextVisit}.`,
  }
}

const GENERATORS = [makeSortingQuestion, makeBinarySearchQuestion, makeBFSQuestion]

export function generateQuiz(count = 10) {
  const questions = []
  for (let i = 0; i < count; i++) {
    const gen = GENERATORS[i % GENERATORS.length]
    try {
      questions.push(gen())
    } catch {
      // retry with a different generator
      questions.push(GENERATORS[(i + 1) % GENERATORS.length]())
    }
  }
  return shuffle(questions)
}

export const HIGH_SCORE_KEY = 'dsa-visual:quiz-high-score'

export function loadHighScore() {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY)
    const n = parseInt(raw, 10)
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

export function saveHighScore(score) {
  if (typeof window === 'undefined') return
  try {
    const current = loadHighScore()
    if (score > current) {
      localStorage.setItem(HIGH_SCORE_KEY, String(score))
    }
  } catch {
    // ignore
  }
}
