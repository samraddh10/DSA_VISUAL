import { STEP_TYPES } from '../../engine/types.js'

let nextId = 1
export function resetSQIdCounter() {
  nextId = 1
}

function makeItem(value) {
  return { id: nextId++, value }
}

function cloneItems(items) {
  return items.map((it) => ({ ...it }))
}

// ─── Stack Operations ───

export function stackPush(items, value) {
  const steps = []
  const newItem = makeItem(value)

  steps.push({
    highlights: [],
    type: STEP_TYPES.INSERT,
    codeLine: 0,
    description: `Pushing ${value} onto the stack`,
    state: { items: cloneItems(items), newItem: null, removedItem: null },
  })

  const updated = [...cloneItems(items), { ...newItem }]
  steps.push({
    highlights: [newItem.id],
    type: STEP_TYPES.INSERT,
    codeLine: 1,
    description: `${value} pushed — now on top of the stack`,
    state: { items: cloneItems(updated), newItem: newItem.id, removedItem: null },
  })

  return { steps, items: updated }
}

export function stackPop(items) {
  const steps = []

  if (items.length === 0) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'Stack is empty — nothing to pop',
      state: { items: [], newItem: null, removedItem: null },
    })
    return { steps, items: [] }
  }

  const top = items[items.length - 1]
  steps.push({
    highlights: [top.id],
    type: STEP_TYPES.DELETE,
    codeLine: 0,
    description: `Popping ${top.value} from the top of the stack`,
    state: { items: cloneItems(items), newItem: null, removedItem: top.id },
  })

  const updated = cloneItems(items).slice(0, -1)
  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 1,
    description: `${top.value} removed. ${updated.length > 0 ? `Top is now ${updated[updated.length - 1].value}` : 'Stack is empty'}`,
    state: { items: cloneItems(updated), newItem: null, removedItem: null },
  })

  return { steps, items: updated }
}

export function stackPeek(items) {
  const steps = []

  if (items.length === 0) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'Stack is empty — nothing to peek',
      state: { items: [], newItem: null, removedItem: null },
    })
    return { steps }
  }

  const top = items[items.length - 1]
  steps.push({
    highlights: [top.id],
    type: STEP_TYPES.VISIT,
    codeLine: 0,
    description: `Peek → top element is ${top.value}`,
    state: { items: cloneItems(items), newItem: null, removedItem: null },
  })

  return { steps }
}

// ─── Queue Operations ───

export function queueEnqueue(items, value) {
  const steps = []
  const newItem = makeItem(value)

  steps.push({
    highlights: [],
    type: STEP_TYPES.INSERT,
    codeLine: 0,
    description: `Enqueuing ${value} at the rear`,
    state: { items: cloneItems(items), newItem: null, removedItem: null },
  })

  const updated = [...cloneItems(items), { ...newItem }]
  steps.push({
    highlights: [newItem.id],
    type: STEP_TYPES.INSERT,
    codeLine: 1,
    description: `${value} added to the rear of the queue`,
    state: { items: cloneItems(updated), newItem: newItem.id, removedItem: null },
  })

  return { steps, items: updated }
}

export function queueDequeue(items) {
  const steps = []

  if (items.length === 0) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'Queue is empty — nothing to dequeue',
      state: { items: [], newItem: null, removedItem: null },
    })
    return { steps, items: [] }
  }

  const front = items[0]
  steps.push({
    highlights: [front.id],
    type: STEP_TYPES.DELETE,
    codeLine: 0,
    description: `Dequeuing ${front.value} from the front`,
    state: { items: cloneItems(items), newItem: null, removedItem: front.id },
  })

  const updated = cloneItems(items).slice(1)
  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 1,
    description: `${front.value} removed. ${updated.length > 0 ? `Front is now ${updated[0].value}` : 'Queue is empty'}`,
    state: { items: cloneItems(updated), newItem: null, removedItem: null },
  })

  return { steps, items: updated }
}

export function queuePeek(items) {
  const steps = []

  if (items.length === 0) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'Queue is empty — nothing to peek',
      state: { items: [], newItem: null, removedItem: null },
    })
    return { steps }
  }

  const front = items[0]
  steps.push({
    highlights: [front.id],
    type: STEP_TYPES.VISIT,
    codeLine: 0,
    description: `Peek → front element is ${front.value}`,
    state: { items: cloneItems(items), newItem: null, removedItem: null },
  })

  return { steps }
}

// ─── Meta ───

export const stackMeta = {
  id: 'stack',
  name: 'Stack',
  category: 'stack-queue',
  timeComplexity: 'O(1)',
  spaceComplexity: 'O(n)',
  bestCase: 'O(1)',
  worstCase: 'O(1)',
  stable: true,
  description:
    'A LIFO (Last In, First Out) data structure. Push adds to the top, pop removes from the top.',
  code: {
    javascript: [
      'class Stack {',
      '  constructor() { this.items = []; }',
      '',
      '  push(value) {',
      '    this.items.push(value);',
      '  }',
      '',
      '  pop() {',
      '    if (this.isEmpty()) return null;',
      '    return this.items.pop();',
      '  }',
      '',
      '  peek() {',
      '    if (this.isEmpty()) return null;',
      '    return this.items[this.items.length - 1];',
      '  }',
      '',
      '  isEmpty() {',
      '    return this.items.length === 0;',
      '  }',
      '}',
    ],
    cpp: [
      'class Stack {',
      '    vector<int> items;',
      'public:',
      '    void push(int value) {',
      '        items.push_back(value);',
      '    }',
      '',
      '    int pop() {',
      '        if (isEmpty()) return -1;',
      '        int val = items.back();',
      '        items.pop_back();',
      '        return val;',
      '    }',
      '',
      '    int peek() {',
      '        if (isEmpty()) return -1;',
      '        return items.back();',
      '    }',
      '',
      '    bool isEmpty() {',
      '        return items.empty();',
      '    }',
      '};',
    ],
    c: [
      '#define MAX 100',
      'typedef struct {',
      '    int items[MAX];',
      '    int top;',
      '} Stack;',
      '',
      'void init(Stack* s) { s->top = -1; }',
      '',
      'void push(Stack* s, int value) {',
      '    if (s->top >= MAX - 1) return;',
      '    s->items[++s->top] = value;',
      '}',
      '',
      'int pop(Stack* s) {',
      '    if (s->top < 0) return -1;',
      '    return s->items[s->top--];',
      '}',
      '',
      'int peek(Stack* s) {',
      '    if (s->top < 0) return -1;',
      '    return s->items[s->top];',
      '}',
    ],
    python: [
      'class Stack:',
      '    def __init__(self):',
      '        self.items = []',
      '',
      '    def push(self, value):',
      '        self.items.append(value)',
      '',
      '    def pop(self):',
      '        if self.is_empty(): return None',
      '        return self.items.pop()',
      '',
      '    def peek(self):',
      '        if self.is_empty(): return None',
      '        return self.items[-1]',
      '',
      '    def is_empty(self):',
      '        return len(self.items) == 0',
    ],
    java: [
      'class Stack {',
      '    private ArrayList<Integer> items = new ArrayList<>();',
      '',
      '    void push(int value) {',
      '        items.add(value);',
      '    }',
      '',
      '    int pop() {',
      '        if (isEmpty()) return -1;',
      '        return items.remove(items.size() - 1);',
      '    }',
      '',
      '    int peek() {',
      '        if (isEmpty()) return -1;',
      '        return items.get(items.size() - 1);',
      '    }',
      '',
      '    boolean isEmpty() {',
      '        return items.isEmpty();',
      '    }',
      '}',
    ],
  },
}

export const queueMeta = {
  id: 'queue',
  name: 'Queue',
  category: 'stack-queue',
  timeComplexity: 'O(1)',
  spaceComplexity: 'O(n)',
  bestCase: 'O(1)',
  worstCase: 'O(1)',
  stable: true,
  description:
    'A FIFO (First In, First Out) data structure. Enqueue adds to the rear, dequeue removes from the front.',
  code: {
    javascript: [
      'class Queue {',
      '  constructor() { this.items = []; }',
      '',
      '  enqueue(value) {',
      '    this.items.push(value);',
      '  }',
      '',
      '  dequeue() {',
      '    if (this.isEmpty()) return null;',
      '    return this.items.shift();',
      '  }',
      '',
      '  peek() {',
      '    if (this.isEmpty()) return null;',
      '    return this.items[0];',
      '  }',
      '',
      '  isEmpty() {',
      '    return this.items.length === 0;',
      '  }',
      '}',
    ],
    cpp: [
      'class Queue {',
      '    queue<int> q;',
      'public:',
      '    void enqueue(int value) {',
      '        q.push(value);',
      '    }',
      '',
      '    int dequeue() {',
      '        if (q.empty()) return -1;',
      '        int val = q.front();',
      '        q.pop();',
      '        return val;',
      '    }',
      '',
      '    int peek() {',
      '        if (q.empty()) return -1;',
      '        return q.front();',
      '    }',
      '',
      '    bool isEmpty() {',
      '        return q.empty();',
      '    }',
      '};',
    ],
    c: [
      '#define MAX 100',
      'typedef struct {',
      '    int items[MAX];',
      '    int front, rear;',
      '} Queue;',
      '',
      'void init(Queue* q) { q->front = q->rear = 0; }',
      '',
      'void enqueue(Queue* q, int value) {',
      '    if (q->rear >= MAX) return;',
      '    q->items[q->rear++] = value;',
      '}',
      '',
      'int dequeue(Queue* q) {',
      '    if (q->front >= q->rear) return -1;',
      '    return q->items[q->front++];',
      '}',
      '',
      'int peek(Queue* q) {',
      '    if (q->front >= q->rear) return -1;',
      '    return q->items[q->front];',
      '}',
    ],
    python: [
      'from collections import deque',
      '',
      'class Queue:',
      '    def __init__(self):',
      '        self.items = deque()',
      '',
      '    def enqueue(self, value):',
      '        self.items.append(value)',
      '',
      '    def dequeue(self):',
      '        if self.is_empty(): return None',
      '        return self.items.popleft()',
      '',
      '    def peek(self):',
      '        if self.is_empty(): return None',
      '        return self.items[0]',
      '',
      '    def is_empty(self):',
      '        return len(self.items) == 0',
    ],
    java: [
      'class Queue {',
      '    private LinkedList<Integer> items = new LinkedList<>();',
      '',
      '    void enqueue(int value) {',
      '        items.addLast(value);',
      '    }',
      '',
      '    int dequeue() {',
      '        if (isEmpty()) return -1;',
      '        return items.removeFirst();',
      '    }',
      '',
      '    int peek() {',
      '        if (isEmpty()) return -1;',
      '        return items.getFirst();',
      '    }',
      '',
      '    boolean isEmpty() {',
      '        return items.isEmpty();',
      '    }',
      '}',
    ],
  },
}
