import { STEP_TYPES } from '../../engine/types.js'

// ─── Linked List Node ───
// { id, value, next (id|null), prev (id|null — doubly only) }

let nextId = 1
export function resetIdCounter() {
  nextId = 1
}

function makeNode(value, next = null, prev = null) {
  return { id: nextId++, value, next, prev }
}

function cloneList(nodes) {
  return nodes.map((n) => ({ ...n }))
}

function toArray(nodes, headId) {
  const map = new Map(nodes.map((n) => [n.id, n]))
  const arr = []
  let cur = headId
  while (cur !== null) {
    const node = map.get(cur)
    if (!node) break
    arr.push(node)
    cur = node.next
  }
  return arr
}

// ─── Operations ───

export function insertAtHead(nodes, headId, value, type) {
  const steps = []
  const newNode = makeNode(value)

  steps.push({
    highlights: [],
    type: STEP_TYPES.INSERT,
    codeLine: 0,
    description: `Creating new node with value ${value}`,
    state: { nodes: cloneList(nodes), headId, newNode: null, removedNode: null },
  })

  newNode.next = headId
  if (type === 'doubly' && headId !== null) {
    const updated = cloneList(nodes)
    const oldHead = updated.find((n) => n.id === headId)
    if (oldHead) oldHead.prev = newNode.id
    newNode.prev = null
    const allNodes = [{ ...newNode }, ...updated]
    steps.push({
      highlights: [newNode.id],
      type: STEP_TYPES.INSERT,
      codeLine: 1,
      description: `Inserting ${value} at head, pointing next to old head`,
      state: { nodes: cloneList(allNodes), headId: newNode.id, newNode: newNode.id, removedNode: null },
    })
    return { steps, nodes: allNodes, headId: newNode.id }
  }

  const allNodes = [{ ...newNode }, ...cloneList(nodes)]
  steps.push({
    highlights: [newNode.id],
    type: STEP_TYPES.INSERT,
    codeLine: 1,
    description: `Inserting ${value} at head, pointing next to old head`,
    state: { nodes: cloneList(allNodes), headId: newNode.id, newNode: newNode.id, removedNode: null },
  })

  return { steps, nodes: allNodes, headId: newNode.id }
}

export function insertAtTail(nodes, headId, value, type) {
  const steps = []
  const newNode = makeNode(value)

  if (headId === null) {
    const allNodes = [{ ...newNode }]
    steps.push({
      highlights: [newNode.id],
      type: STEP_TYPES.INSERT,
      codeLine: 0,
      description: `List is empty — inserting ${value} as head`,
      state: { nodes: cloneList(allNodes), headId: newNode.id, newNode: newNode.id, removedNode: null },
    })
    return { steps, nodes: allNodes, headId: newNode.id }
  }

  const ordered = toArray(nodes, headId)

  // Traverse to tail
  for (let i = 0; i < ordered.length; i++) {
    steps.push({
      highlights: [ordered[i].id],
      type: STEP_TYPES.VISIT,
      codeLine: 1,
      description: `Traversing → node ${ordered[i].value}${i === ordered.length - 1 ? ' (tail)' : ''}`,
      state: { nodes: cloneList(nodes), headId, newNode: null, removedNode: null },
    })
  }

  const updated = cloneList(nodes)
  const tail = updated.find((n) => n.id === ordered[ordered.length - 1].id)
  tail.next = newNode.id
  if (type === 'doubly') newNode.prev = tail.id

  const allNodes = [...updated, { ...newNode }]
  steps.push({
    highlights: [newNode.id],
    type: STEP_TYPES.INSERT,
    codeLine: 2,
    description: `Appending ${value} at tail`,
    state: { nodes: cloneList(allNodes), headId, newNode: newNode.id, removedNode: null },
  })

  return { steps, nodes: allNodes, headId }
}

export function insertAtPosition(nodes, headId, value, position, type) {
  if (position <= 0) return insertAtHead(nodes, headId, value, type)

  const ordered = toArray(nodes, headId)
  if (position >= ordered.length) return insertAtTail(nodes, headId, value, type)

  const steps = []
  const newNode = makeNode(value)

  // Traverse to position - 1
  for (let i = 0; i < position; i++) {
    steps.push({
      highlights: [ordered[i].id],
      type: STEP_TYPES.VISIT,
      codeLine: 1,
      description: `Traversing → node ${ordered[i].value} (position ${i})`,
      state: { nodes: cloneList(nodes), headId, newNode: null, removedNode: null },
    })
  }

  const updated = cloneList(nodes)
  const prevNode = updated.find((n) => n.id === ordered[position - 1].id)
  const nextNode = updated.find((n) => n.id === ordered[position].id)

  newNode.next = nextNode.id
  prevNode.next = newNode.id
  if (type === 'doubly') {
    newNode.prev = prevNode.id
    nextNode.prev = newNode.id
  }

  const allNodes = [...updated, { ...newNode }]
  steps.push({
    highlights: [newNode.id],
    type: STEP_TYPES.INSERT,
    codeLine: 2,
    description: `Inserting ${value} at position ${position}`,
    state: { nodes: cloneList(allNodes), headId, newNode: newNode.id, removedNode: null },
  })

  return { steps, nodes: allNodes, headId }
}

export function deleteHead(nodes, headId, type) {
  const steps = []

  if (headId === null) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'List is empty — nothing to delete',
      state: { nodes: [], headId: null, newNode: null, removedNode: null },
    })
    return { steps, nodes: [], headId: null }
  }

  const ordered = toArray(nodes, headId)
  const head = ordered[0]

  steps.push({
    highlights: [head.id],
    type: STEP_TYPES.DELETE,
    codeLine: 0,
    description: `Removing head node with value ${head.value}`,
    state: { nodes: cloneList(nodes), headId, newNode: null, removedNode: head.id },
  })

  const updated = cloneList(nodes).filter((n) => n.id !== head.id)
  const newHeadId = head.next

  if (type === 'doubly' && newHeadId !== null) {
    const newHead = updated.find((n) => n.id === newHeadId)
    if (newHead) newHead.prev = null
  }

  steps.push({
    highlights: newHeadId !== null ? [newHeadId] : [],
    type: STEP_TYPES.DONE,
    codeLine: 1,
    description: newHeadId !== null ? `New head is ${updated.find((n) => n.id === newHeadId)?.value}` : 'List is now empty',
    state: { nodes: cloneList(updated), headId: newHeadId, newNode: null, removedNode: null },
  })

  return { steps, nodes: updated, headId: newHeadId }
}

export function deleteTail(nodes, headId, type) {
  const steps = []

  if (headId === null) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'List is empty — nothing to delete',
      state: { nodes: [], headId: null, newNode: null, removedNode: null },
    })
    return { steps, nodes: [], headId: null }
  }

  const ordered = toArray(nodes, headId)
  if (ordered.length === 1) return deleteHead(nodes, headId, type)

  // Traverse to tail
  for (let i = 0; i < ordered.length; i++) {
    steps.push({
      highlights: [ordered[i].id],
      type: STEP_TYPES.VISIT,
      codeLine: 1,
      description: `Traversing → node ${ordered[i].value}${i === ordered.length - 1 ? ' (tail)' : ''}`,
      state: { nodes: cloneList(nodes), headId, newNode: null, removedNode: null },
    })
  }

  const tail = ordered[ordered.length - 1]
  steps.push({
    highlights: [tail.id],
    type: STEP_TYPES.DELETE,
    codeLine: 2,
    description: `Removing tail node with value ${tail.value}`,
    state: { nodes: cloneList(nodes), headId, newNode: null, removedNode: tail.id },
  })

  const updated = cloneList(nodes).filter((n) => n.id !== tail.id)
  const newTail = updated.find((n) => n.id === ordered[ordered.length - 2].id)
  if (newTail) {
    newTail.next = null
    if (type === 'doubly') newTail.prev = ordered.length > 2 ? ordered[ordered.length - 3].id : null
  }

  steps.push({
    highlights: newTail ? [newTail.id] : [],
    type: STEP_TYPES.DONE,
    codeLine: 3,
    description: `Tail removed. New tail is ${newTail?.value}`,
    state: { nodes: cloneList(updated), headId, newNode: null, removedNode: null },
  })

  return { steps, nodes: updated, headId }
}

export function searchList(nodes, headId, value) {
  const steps = []
  const ordered = toArray(nodes, headId)

  if (ordered.length === 0) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'List is empty',
      state: { nodes: [], headId: null, newNode: null, removedNode: null },
    })
    return { steps }
  }

  for (let i = 0; i < ordered.length; i++) {
    steps.push({
      highlights: [ordered[i].id],
      type: STEP_TYPES.COMPARE,
      codeLine: 1,
      description: `Checking node ${ordered[i].value} — is it ${value}?`,
      state: { nodes: cloneList(nodes), headId, newNode: null, removedNode: null },
    })

    if (ordered[i].value === value) {
      steps.push({
        highlights: [ordered[i].id],
        type: STEP_TYPES.FOUND,
        codeLine: 2,
        description: `Found ${value} at position ${i}!`,
        state: { nodes: cloneList(nodes), headId, newNode: null, removedNode: null },
      })
      return { steps }
    }
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 3,
    description: `Value ${value} not found in the list`,
    state: { nodes: cloneList(nodes), headId, newNode: null, removedNode: null },
  })
  return { steps }
}

export function traverseList(nodes, headId) {
  const steps = []
  const ordered = toArray(nodes, headId)

  if (ordered.length === 0) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'List is empty',
      state: { nodes: [], headId: null, newNode: null, removedNode: null },
    })
    return { steps }
  }

  for (let i = 0; i < ordered.length; i++) {
    steps.push({
      highlights: [ordered[i].id],
      type: STEP_TYPES.VISIT,
      codeLine: 1,
      description: `Visiting node ${ordered[i].value} (position ${i})`,
      state: { nodes: cloneList(nodes), headId, newNode: null, removedNode: null },
    })
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 2,
    description: `Traversal complete — ${ordered.length} nodes visited`,
    state: { nodes: cloneList(nodes), headId, newNode: null, removedNode: null },
  })

  return { steps }
}

// ─── Meta ───

export const linkedListMeta = {
  id: 'linked-list',
  name: 'Linked List',
  category: 'linked-list',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  bestCase: 'O(1)',
  worstCase: 'O(n)',
  stable: true,
  description:
    'A linear data structure where elements are linked using pointers. Supports singly and doubly linked variants.',
  code: {
    javascript: [
      'class Node {',
      '  constructor(value) {',
      '    this.value = value;',
      '    this.next = null;',
      '    this.prev = null; // doubly only',
      '  }',
      '}',
      '',
      'class LinkedList {',
      '  constructor() { this.head = null; }',
      '',
      '  insertHead(value) {',
      '    const node = new Node(value);',
      '    node.next = this.head;',
      '    this.head = node;',
      '  }',
      '',
      '  insertTail(value) {',
      '    const node = new Node(value);',
      '    if (!this.head) { this.head = node; return; }',
      '    let cur = this.head;',
      '    while (cur.next) cur = cur.next;',
      '    cur.next = node;',
      '  }',
      '',
      '  deleteHead() {',
      '    if (!this.head) return;',
      '    this.head = this.head.next;',
      '  }',
      '',
      '  search(value) {',
      '    let cur = this.head;',
      '    while (cur) {',
      '      if (cur.value === value) return cur;',
      '      cur = cur.next;',
      '    }',
      '    return null;',
      '  }',
      '}',
    ],
    cpp: [
      'struct Node {',
      '    int value;',
      '    Node* next;',
      '    Node* prev; // doubly only',
      '    Node(int v) : value(v), next(nullptr), prev(nullptr) {}',
      '};',
      '',
      'class LinkedList {',
      '    Node* head = nullptr;',
      'public:',
      '    void insertHead(int value) {',
      '        Node* node = new Node(value);',
      '        node->next = head;',
      '        head = node;',
      '    }',
      '',
      '    void insertTail(int value) {',
      '        Node* node = new Node(value);',
      '        if (!head) { head = node; return; }',
      '        Node* cur = head;',
      '        while (cur->next) cur = cur->next;',
      '        cur->next = node;',
      '    }',
      '',
      '    void deleteHead() {',
      '        if (!head) return;',
      '        Node* temp = head;',
      '        head = head->next;',
      '        delete temp;',
      '    }',
      '};',
    ],
    c: [
      'typedef struct Node {',
      '    int value;',
      '    struct Node* next;',
      '    struct Node* prev;',
      '} Node;',
      '',
      'Node* createNode(int value) {',
      '    Node* n = malloc(sizeof(Node));',
      '    n->value = value;',
      '    n->next = n->prev = NULL;',
      '    return n;',
      '}',
      '',
      'void insertHead(Node** head, int value) {',
      '    Node* n = createNode(value);',
      '    n->next = *head;',
      '    *head = n;',
      '}',
      '',
      'void deleteHead(Node** head) {',
      '    if (!*head) return;',
      '    Node* temp = *head;',
      '    *head = (*head)->next;',
      '    free(temp);',
      '}',
    ],
    python: [
      'class Node:',
      '    def __init__(self, value):',
      '        self.value = value',
      '        self.next = None',
      '        self.prev = None  # doubly only',
      '',
      'class LinkedList:',
      '    def __init__(self):',
      '        self.head = None',
      '',
      '    def insert_head(self, value):',
      '        node = Node(value)',
      '        node.next = self.head',
      '        self.head = node',
      '',
      '    def insert_tail(self, value):',
      '        node = Node(value)',
      '        if not self.head:',
      '            self.head = node',
      '            return',
      '        cur = self.head',
      '        while cur.next:',
      '            cur = cur.next',
      '        cur.next = node',
      '',
      '    def delete_head(self):',
      '        if not self.head: return',
      '        self.head = self.head.next',
      '',
      '    def search(self, value):',
      '        cur = self.head',
      '        while cur:',
      '            if cur.value == value: return cur',
      '            cur = cur.next',
      '        return None',
    ],
    java: [
      'class Node {',
      '    int value;',
      '    Node next, prev;',
      '    Node(int v) { value = v; next = prev = null; }',
      '}',
      '',
      'class LinkedList {',
      '    Node head = null;',
      '',
      '    void insertHead(int value) {',
      '        Node node = new Node(value);',
      '        node.next = head;',
      '        head = node;',
      '    }',
      '',
      '    void insertTail(int value) {',
      '        Node node = new Node(value);',
      '        if (head == null) { head = node; return; }',
      '        Node cur = head;',
      '        while (cur.next != null) cur = cur.next;',
      '        cur.next = node;',
      '    }',
      '',
      '    void deleteHead() {',
      '        if (head == null) return;',
      '        head = head.next;',
      '    }',
      '',
      '    Node search(int value) {',
      '        Node cur = head;',
      '        while (cur != null) {',
      '            if (cur.value == value) return cur;',
      '            cur = cur.next;',
      '        }',
      '        return null;',
      '    }',
      '}',
    ],
  },
}
