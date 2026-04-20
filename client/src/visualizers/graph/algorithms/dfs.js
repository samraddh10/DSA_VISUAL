import { STEP_TYPES } from '../../../engine/types.js'

function buildAdj(nodes, edges, directed = false) {
  const adj = new Map()
  for (const n of nodes) adj.set(n.id, [])
  for (const e of edges) {
    adj.get(e.source).push({ to: e.target, edge: e })
    if (!directed) adj.get(e.target).push({ to: e.source, edge: e })
  }
  for (const [, list] of adj) list.sort((a, b) => a.to - b.to)
  return adj
}

function edgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`
}

function nodeLabel(nodes, id) {
  const n = nodes.find((x) => x.id === id)
  return n?.label ?? String(id)
}

export default function dfs(nodes, edges, startId) {
  const steps = []
  if (!nodes || nodes.length === 0 || startId == null) return steps

  const adj = buildAdj(nodes, edges)
  const visited = new Set()
  const exploredEdges = new Set()
  const visitOrder = []
  const stack = [startId]

  steps.push({
    highlights: [startId],
    type: STEP_TYPES.VISIT,
    codeLine: 2,
    description: `Push start ${nodeLabel(nodes, startId)} onto stack`,
    state: {
      visited: [],
      stack: [...stack],
      current: null,
      exploredEdges: [],
      visitOrder: [],
    },
  })

  while (stack.length > 0) {
    const current = stack.pop()

    if (visited.has(current)) {
      steps.push({
        highlights: [current],
        type: STEP_TYPES.COMPARE,
        codeLine: 5,
        description: `Pop ${nodeLabel(nodes, current)} — already visited, skip`,
        state: {
          visited: [...visited],
          stack: [...stack],
          current,
          exploredEdges: [...exploredEdges],
          visitOrder: [...visitOrder],
        },
      })
      continue
    }

    visited.add(current)
    visitOrder.push(current)

    steps.push({
      highlights: [current],
      type: STEP_TYPES.VISIT,
      codeLine: 6,
      description: `Visit ${nodeLabel(nodes, current)}`,
      state: {
        visited: [...visited],
        stack: [...stack],
        current,
        exploredEdges: [...exploredEdges],
        visitOrder: [...visitOrder],
      },
    })

    const neighbors = [...(adj.get(current) || [])].reverse()
    for (const { to, edge } of neighbors) {
      const key = edgeKey(edge.source, edge.target)
      exploredEdges.add(key)

      if (!visited.has(to)) {
        stack.push(to)
        steps.push({
          highlights: [current, to],
          type: STEP_TYPES.SET,
          codeLine: 8,
          description: `Push neighbor ${nodeLabel(nodes, to)} onto stack`,
          state: {
            visited: [...visited],
            stack: [...stack],
            current,
            exploredEdges: [...exploredEdges],
            visitOrder: [...visitOrder],
          },
        })
      }
    }
  }

  steps.push({
    highlights: [...visited],
    type: STEP_TYPES.DONE,
    codeLine: 10,
    description: `DFS complete — visited ${visitOrder.length} node${visitOrder.length === 1 ? '' : 's'}`,
    state: {
      visited: [...visited],
      stack: [],
      current: null,
      exploredEdges: [...exploredEdges],
      visitOrder: [...visitOrder],
    },
  })

  return steps
}

export const dfsMeta = {
  id: 'dfs',
  name: 'Depth-First Search',
  category: 'graph',
  timeComplexity: 'O(V + E)',
  spaceComplexity: 'O(V)',
  bestCase: 'O(V + E)',
  worstCase: 'O(V + E)',
  stable: true,
  description:
    'Explores as far as possible along each branch before backtracking — uses a stack (or recursion).',
  code: {
    javascript: [
      'function dfs(graph, start) {',
      '  const visited = new Set();',
      '  const stack = [start];',
      '  while (stack.length > 0) {',
      '    const node = stack.pop();',
      '    if (visited.has(node)) continue;',
      '    visited.add(node);',
      '    for (const nb of graph[node]) {',
      '      if (!visited.has(nb)) stack.push(nb);',
      '    }',
      '  }',
      '  return visited;',
      '}',
    ],
    cpp: [
      'void dfs(vector<vector<int>>& graph, int start) {',
      '    unordered_set<int> visited;',
      '    stack<int> st;',
      '    st.push(start);',
      '    while (!st.empty()) {',
      '        int node = st.top(); st.pop();',
      '        if (visited.count(node)) continue;',
      '        visited.insert(node);',
      '        for (int nb : graph[node])',
      '            if (!visited.count(nb)) st.push(nb);',
      '    }',
      '}',
    ],
    c: [
      'void dfs(int graph[][N], int n, int start) {',
      '    int visited[N] = {0};',
      '    int stack[N], top = -1;',
      '    stack[++top] = start;',
      '    while (top >= 0) {',
      '        int node = stack[top--];',
      '        if (visited[node]) continue;',
      '        visited[node] = 1;',
      '        for (int i = 0; i < n; i++)',
      '            if (graph[node][i] && !visited[i])',
      '                stack[++top] = i;',
      '    }',
      '}',
    ],
    python: [
      'def dfs(graph, start):',
      '    visited = set()',
      '    stack = [start]',
      '    while stack:',
      '        node = stack.pop()',
      '        if node in visited: continue',
      '        visited.add(node)',
      '        for nb in graph[node]:',
      '            if nb not in visited:',
      '                stack.append(nb)',
      '    return visited',
    ],
    java: [
      'void dfs(Map<Integer,List<Integer>> graph, int start) {',
      '    Set<Integer> visited = new HashSet<>();',
      '    Deque<Integer> stack = new ArrayDeque<>();',
      '    stack.push(start);',
      '    while (!stack.isEmpty()) {',
      '        int node = stack.pop();',
      '        if (visited.contains(node)) continue;',
      '        visited.add(node);',
      '        for (int nb : graph.get(node))',
      '            if (!visited.contains(nb)) stack.push(nb);',
      '    }',
      '}',
    ],
  },
}
