import { STEP_TYPES } from '../../engine/types.js'

// ─── BST Node shape ───
// { id, value, left: node|null, right: node|null }

let nextId = 1
export function resetBSTIdCounter() {
  nextId = 1
}

function makeNode(value) {
  return { id: nextId++, value, left: null, right: null }
}

function cloneTree(node) {
  if (!node) return null
  return { id: node.id, value: node.value, left: cloneTree(node.left), right: cloneTree(node.right) }
}

function treeToSnapshot(root) {
  return cloneTree(root)
}

function findMin(node) {
  let cur = node
  while (cur.left) cur = cur.left
  return cur
}

function collectIds(node) {
  if (!node) return []
  return [node.id, ...collectIds(node.left), ...collectIds(node.right)]
}

// ─── Insert ───

export function bstInsert(root, value) {
  const steps = []
  const newNode = makeNode(value)

  if (!root) {
    const newRoot = { ...newNode }
    steps.push({
      highlights: [newNode.id],
      type: STEP_TYPES.INSERT,
      codeLine: 0,
      description: `Tree is empty — inserting ${value} as root`,
      state: { root: treeToSnapshot(newRoot), highlightedNodes: [newNode.id], insertedNode: newNode.id, removedNode: null, foundNode: null },
    })
    return { steps, root: newRoot }
  }

  // Traverse to find insertion point
  let current = root
  const path = []

  while (current) {
    path.push(current.id)
    steps.push({
      highlights: [current.id],
      type: STEP_TYPES.COMPARE,
      codeLine: 2,
      description: `Comparing ${value} with ${current.value}`,
      state: { root: treeToSnapshot(root), highlightedNodes: [current.id], insertedNode: null, removedNode: null, foundNode: null },
    })

    if (value < current.value) {
      if (!current.left) {
        current.left = { ...newNode }
        steps.push({
          highlights: [newNode.id],
          type: STEP_TYPES.INSERT,
          codeLine: 3,
          description: `${value} < ${current.value} — inserting as left child`,
          state: { root: treeToSnapshot(root), highlightedNodes: [newNode.id], insertedNode: newNode.id, removedNode: null, foundNode: null },
        })
        return { steps, root }
      }
      current = current.left
    } else if (value > current.value) {
      if (!current.right) {
        current.right = { ...newNode }
        steps.push({
          highlights: [newNode.id],
          type: STEP_TYPES.INSERT,
          codeLine: 5,
          description: `${value} > ${current.value} — inserting as right child`,
          state: { root: treeToSnapshot(root), highlightedNodes: [newNode.id], insertedNode: newNode.id, removedNode: null, foundNode: null },
        })
        return { steps, root }
      }
      current = current.right
    } else {
      // Duplicate
      steps.push({
        highlights: [current.id],
        type: STEP_TYPES.DONE,
        codeLine: 6,
        description: `${value} already exists in the tree`,
        state: { root: treeToSnapshot(root), highlightedNodes: [current.id], insertedNode: null, removedNode: null, foundNode: null },
      })
      return { steps, root }
    }
  }

  return { steps, root }
}

// ─── Delete ───

export function bstDelete(root, value) {
  const steps = []

  if (!root) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'Tree is empty — nothing to delete',
      state: { root: null, highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null },
    })
    return { steps, root: null }
  }

  function deleteNode(node, val) {
    if (!node) {
      steps.push({
        highlights: [],
        type: STEP_TYPES.DONE,
        codeLine: 7,
        description: `Value ${val} not found in the tree`,
        state: { root: treeToSnapshot(root), highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null },
      })
      return node
    }

    steps.push({
      highlights: [node.id],
      type: STEP_TYPES.COMPARE,
      codeLine: 1,
      description: `Comparing ${val} with ${node.value}`,
      state: { root: treeToSnapshot(root), highlightedNodes: [node.id], insertedNode: null, removedNode: null, foundNode: null },
    })

    if (val < node.value) {
      node.left = deleteNode(node.left, val)
    } else if (val > node.value) {
      node.right = deleteNode(node.right, val)
    } else {
      // Found the node to delete
      const removedId = node.id
      steps.push({
        highlights: [removedId],
        type: STEP_TYPES.DELETE,
        codeLine: 2,
        description: `Found ${val} — removing node`,
        state: { root: treeToSnapshot(root), highlightedNodes: [removedId], insertedNode: null, removedNode: removedId, foundNode: null },
      })

      if (!node.left && !node.right) {
        // Leaf node
        return null
      } else if (!node.left) {
        // Only right child
        steps.push({
          highlights: [node.right.id],
          type: STEP_TYPES.SET,
          codeLine: 3,
          description: `Replacing with right child (${node.right.value})`,
          state: { root: treeToSnapshot(root), highlightedNodes: [node.right.id], insertedNode: null, removedNode: removedId, foundNode: null },
        })
        return node.right
      } else if (!node.right) {
        // Only left child
        steps.push({
          highlights: [node.left.id],
          type: STEP_TYPES.SET,
          codeLine: 3,
          description: `Replacing with left child (${node.left.value})`,
          state: { root: treeToSnapshot(root), highlightedNodes: [node.left.id], insertedNode: null, removedNode: removedId, foundNode: null },
        })
        return node.left
      } else {
        // Two children: find inorder successor
        const successor = findMin(node.right)
        steps.push({
          highlights: [successor.id],
          type: STEP_TYPES.SEARCH,
          codeLine: 4,
          description: `Inorder successor is ${successor.value}`,
          state: { root: treeToSnapshot(root), highlightedNodes: [successor.id], insertedNode: null, removedNode: removedId, foundNode: null },
        })
        node.value = successor.value
        node.right = deleteNode(node.right, successor.value)
      }
    }
    return node
  }

  root = deleteNode(root, value)

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 5,
    description: `Deletion of ${value} complete`,
    state: { root: treeToSnapshot(root), highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null },
  })

  return { steps, root }
}

// ─── Search ───

export function bstSearch(root, value) {
  const steps = []

  if (!root) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'Tree is empty',
      state: { root: null, highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null },
    })
    return { steps }
  }

  let current = root
  while (current) {
    steps.push({
      highlights: [current.id],
      type: STEP_TYPES.COMPARE,
      codeLine: 1,
      description: `Comparing ${value} with ${current.value}`,
      state: { root: treeToSnapshot(root), highlightedNodes: [current.id], insertedNode: null, removedNode: null, foundNode: null },
    })

    if (value === current.value) {
      steps.push({
        highlights: [current.id],
        type: STEP_TYPES.FOUND,
        codeLine: 2,
        description: `Found ${value}!`,
        state: { root: treeToSnapshot(root), highlightedNodes: [current.id], insertedNode: null, removedNode: null, foundNode: current.id },
      })
      return { steps }
    } else if (value < current.value) {
      steps.push({
        highlights: [current.id],
        type: STEP_TYPES.VISIT,
        codeLine: 3,
        description: `${value} < ${current.value} — go left`,
        state: { root: treeToSnapshot(root), highlightedNodes: [current.id], insertedNode: null, removedNode: null, foundNode: null },
      })
      current = current.left
    } else {
      steps.push({
        highlights: [current.id],
        type: STEP_TYPES.VISIT,
        codeLine: 4,
        description: `${value} > ${current.value} — go right`,
        state: { root: treeToSnapshot(root), highlightedNodes: [current.id], insertedNode: null, removedNode: null, foundNode: null },
      })
      current = current.right
    }
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 5,
    description: `Value ${value} not found in the tree`,
    state: { root: treeToSnapshot(root), highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null },
  })

  return { steps }
}

// ─── Traversals ───

export function inorderTraversal(root) {
  const steps = []
  const result = []

  function inorder(node) {
    if (!node) return
    inorder(node.left)
    result.push(node.value)
    steps.push({
      highlights: [node.id],
      type: STEP_TYPES.VISIT,
      codeLine: 1,
      description: `Visit ${node.value} — result: [${result.join(', ')}]`,
      state: { root: treeToSnapshot(root), highlightedNodes: [node.id], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [...result] },
    })
    inorder(node.right)
  }

  if (!root) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'Tree is empty',
      state: { root: null, highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [] },
    })
    return { steps }
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.VISIT,
    codeLine: 0,
    description: 'Starting Inorder traversal (Left → Root → Right)',
    state: { root: treeToSnapshot(root), highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [] },
  })

  inorder(root)

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 3,
    description: `Inorder complete: [${result.join(', ')}]`,
    state: { root: treeToSnapshot(root), highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [...result] },
  })

  return { steps }
}

export function preorderTraversal(root) {
  const steps = []
  const result = []

  function preorder(node) {
    if (!node) return
    result.push(node.value)
    steps.push({
      highlights: [node.id],
      type: STEP_TYPES.VISIT,
      codeLine: 1,
      description: `Visit ${node.value} — result: [${result.join(', ')}]`,
      state: { root: treeToSnapshot(root), highlightedNodes: [node.id], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [...result] },
    })
    preorder(node.left)
    preorder(node.right)
  }

  if (!root) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'Tree is empty',
      state: { root: null, highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [] },
    })
    return { steps }
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.VISIT,
    codeLine: 0,
    description: 'Starting Preorder traversal (Root → Left → Right)',
    state: { root: treeToSnapshot(root), highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [] },
  })

  preorder(root)

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 3,
    description: `Preorder complete: [${result.join(', ')}]`,
    state: { root: treeToSnapshot(root), highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [...result] },
  })

  return { steps }
}

export function postorderTraversal(root) {
  const steps = []
  const result = []

  function postorder(node) {
    if (!node) return
    postorder(node.left)
    postorder(node.right)
    result.push(node.value)
    steps.push({
      highlights: [node.id],
      type: STEP_TYPES.VISIT,
      codeLine: 1,
      description: `Visit ${node.value} — result: [${result.join(', ')}]`,
      state: { root: treeToSnapshot(root), highlightedNodes: [node.id], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [...result] },
    })
  }

  if (!root) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'Tree is empty',
      state: { root: null, highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [] },
    })
    return { steps }
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.VISIT,
    codeLine: 0,
    description: 'Starting Postorder traversal (Left → Right → Root)',
    state: { root: treeToSnapshot(root), highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [] },
  })

  postorder(root)

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 3,
    description: `Postorder complete: [${result.join(', ')}]`,
    state: { root: treeToSnapshot(root), highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [...result] },
  })

  return { steps }
}

export function levelOrderTraversal(root) {
  const steps = []
  const result = []

  if (!root) {
    steps.push({
      highlights: [],
      type: STEP_TYPES.DONE,
      codeLine: 0,
      description: 'Tree is empty',
      state: { root: null, highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [] },
    })
    return { steps }
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.VISIT,
    codeLine: 0,
    description: 'Starting Level-order traversal (BFS)',
    state: { root: treeToSnapshot(root), highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [] },
  })

  const queue = [root]
  while (queue.length > 0) {
    const node = queue.shift()
    result.push(node.value)
    steps.push({
      highlights: [node.id],
      type: STEP_TYPES.VISIT,
      codeLine: 2,
      description: `Visit ${node.value} — result: [${result.join(', ')}]`,
      state: { root: treeToSnapshot(root), highlightedNodes: [node.id], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [...result] },
    })
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 4,
    description: `Level-order complete: [${result.join(', ')}]`,
    state: { root: treeToSnapshot(root), highlightedNodes: [], insertedNode: null, removedNode: null, foundNode: null, traversalResult: [...result] },
  })

  return { steps }
}

// ─── Meta ───

export const bstMeta = {
  id: 'bst',
  name: 'Binary Search Tree',
  category: 'tree',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(n)',
  bestCase: 'O(log n)',
  worstCase: 'O(n)',
  stable: true,
  description:
    'A binary tree where each node\'s left subtree contains only values less than the node, and the right subtree only values greater.',
  code: {
    javascript: [
      'class Node {',
      '  constructor(value) {',
      '    this.value = value;',
      '    this.left = this.right = null;',
      '  }',
      '}',
      '',
      'function insert(root, value) {',
      '  if (!root) return new Node(value);',
      '  if (value < root.value)',
      '    root.left = insert(root.left, value);',
      '  else if (value > root.value)',
      '    root.right = insert(root.right, value);',
      '  return root;',
      '}',
      '',
      'function search(root, value) {',
      '  if (!root || root.value === value) return root;',
      '  if (value < root.value)',
      '    return search(root.left, value);',
      '  return search(root.right, value);',
      '}',
      '',
      'function deleteNode(root, value) {',
      '  if (!root) return null;',
      '  if (value < root.value)',
      '    root.left = deleteNode(root.left, value);',
      '  else if (value > root.value)',
      '    root.right = deleteNode(root.right, value);',
      '  else {',
      '    if (!root.left) return root.right;',
      '    if (!root.right) return root.left;',
      '    let succ = root.right;',
      '    while (succ.left) succ = succ.left;',
      '    root.value = succ.value;',
      '    root.right = deleteNode(root.right, succ.value);',
      '  }',
      '  return root;',
      '}',
      '',
      '// Inorder: Left → Root → Right',
      'function inorder(node) {',
      '  if (!node) return;',
      '  inorder(node.left);',
      '  visit(node);',
      '  inorder(node.right);',
      '}',
    ],
    cpp: [
      'struct Node {',
      '    int value;',
      '    Node *left, *right;',
      '    Node(int v) : value(v), left(nullptr), right(nullptr) {}',
      '};',
      '',
      'Node* insert(Node* root, int value) {',
      '    if (!root) return new Node(value);',
      '    if (value < root->value)',
      '        root->left = insert(root->left, value);',
      '    else if (value > root->value)',
      '        root->right = insert(root->right, value);',
      '    return root;',
      '}',
      '',
      'Node* search(Node* root, int value) {',
      '    if (!root || root->value == value) return root;',
      '    if (value < root->value)',
      '        return search(root->left, value);',
      '    return search(root->right, value);',
      '}',
      '',
      'Node* findMin(Node* node) {',
      '    while (node->left) node = node->left;',
      '    return node;',
      '}',
      '',
      'Node* deleteNode(Node* root, int value) {',
      '    if (!root) return nullptr;',
      '    if (value < root->value)',
      '        root->left = deleteNode(root->left, value);',
      '    else if (value > root->value)',
      '        root->right = deleteNode(root->right, value);',
      '    else {',
      '        if (!root->left) return root->right;',
      '        if (!root->right) return root->left;',
      '        Node* succ = findMin(root->right);',
      '        root->value = succ->value;',
      '        root->right = deleteNode(root->right, succ->value);',
      '    }',
      '    return root;',
      '}',
    ],
    c: [
      'typedef struct Node {',
      '    int value;',
      '    struct Node *left, *right;',
      '} Node;',
      '',
      'Node* createNode(int value) {',
      '    Node* n = malloc(sizeof(Node));',
      '    n->value = value;',
      '    n->left = n->right = NULL;',
      '    return n;',
      '}',
      '',
      'Node* insert(Node* root, int value) {',
      '    if (!root) return createNode(value);',
      '    if (value < root->value)',
      '        root->left = insert(root->left, value);',
      '    else if (value > root->value)',
      '        root->right = insert(root->right, value);',
      '    return root;',
      '}',
      '',
      'Node* search(Node* root, int value) {',
      '    if (!root || root->value == value) return root;',
      '    if (value < root->value)',
      '        return search(root->left, value);',
      '    return search(root->right, value);',
      '}',
      '',
      'Node* findMin(Node* node) {',
      '    while (node->left) node = node->left;',
      '    return node;',
      '}',
      '',
      'Node* deleteNode(Node* root, int value) {',
      '    if (!root) return NULL;',
      '    if (value < root->value)',
      '        root->left = deleteNode(root->left, value);',
      '    else if (value > root->value)',
      '        root->right = deleteNode(root->right, value);',
      '    else {',
      '        if (!root->left) return root->right;',
      '        if (!root->right) return root->left;',
      '        Node* succ = findMin(root->right);',
      '        root->value = succ->value;',
      '        root->right = deleteNode(root->right, succ->value);',
      '    }',
      '    return root;',
      '}',
    ],
    python: [
      'class Node:',
      '    def __init__(self, value):',
      '        self.value = value',
      '        self.left = self.right = None',
      '',
      'def insert(root, value):',
      '    if not root: return Node(value)',
      '    if value < root.value:',
      '        root.left = insert(root.left, value)',
      '    elif value > root.value:',
      '        root.right = insert(root.right, value)',
      '    return root',
      '',
      'def search(root, value):',
      '    if not root or root.value == value:',
      '        return root',
      '    if value < root.value:',
      '        return search(root.left, value)',
      '    return search(root.right, value)',
      '',
      'def find_min(node):',
      '    while node.left:',
      '        node = node.left',
      '    return node',
      '',
      'def delete(root, value):',
      '    if not root: return None',
      '    if value < root.value:',
      '        root.left = delete(root.left, value)',
      '    elif value > root.value:',
      '        root.right = delete(root.right, value)',
      '    else:',
      '        if not root.left: return root.right',
      '        if not root.right: return root.left',
      '        succ = find_min(root.right)',
      '        root.value = succ.value',
      '        root.right = delete(root.right, succ.value)',
      '    return root',
      '',
      '# Inorder: Left -> Root -> Right',
      'def inorder(node):',
      '    if not node: return',
      '    inorder(node.left)',
      '    visit(node)',
      '    inorder(node.right)',
    ],
    java: [
      'class Node {',
      '    int value;',
      '    Node left, right;',
      '    Node(int v) { value = v; left = right = null; }',
      '}',
      '',
      'Node insert(Node root, int value) {',
      '    if (root == null) return new Node(value);',
      '    if (value < root.value)',
      '        root.left = insert(root.left, value);',
      '    else if (value > root.value)',
      '        root.right = insert(root.right, value);',
      '    return root;',
      '}',
      '',
      'Node search(Node root, int value) {',
      '    if (root == null || root.value == value) return root;',
      '    if (value < root.value)',
      '        return search(root.left, value);',
      '    return search(root.right, value);',
      '}',
      '',
      'Node findMin(Node node) {',
      '    while (node.left != null) node = node.left;',
      '    return node;',
      '}',
      '',
      'Node delete(Node root, int value) {',
      '    if (root == null) return null;',
      '    if (value < root.value)',
      '        root.left = delete(root.left, value);',
      '    else if (value > root.value)',
      '        root.right = delete(root.right, value);',
      '    else {',
      '        if (root.left == null) return root.right;',
      '        if (root.right == null) return root.left;',
      '        Node succ = findMin(root.right);',
      '        root.value = succ.value;',
      '        root.right = delete(root.right, succ.value);',
      '    }',
      '    return root;',
      '}',
    ],
  },
}
