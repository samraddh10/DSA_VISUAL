import { STEP_TYPES } from '../../../engine/types.js'

function buildAdj(nodes, edges, directed = false) {
  const adj = new Map()
  for (const n of nodes) adj.set(n.id, [])
  for (const e of edges) {
    adj.get(e.source).push({ to: e.target, edge: e })
    if (!directed) adj.get(e.target).push({ to: e.source, edge: e })
  }
  return adj
}

function edgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`
}

export default function bfs(nodes, edges, startId) {
  const steps = []
  if (!nodes || nodes.length === 0 || startId == null) return steps

  const adj = buildAdj(nodes, edges)
  const visited = new Set()
  const queue = [startId]
  const exploredEdges = new Set()
  const visitOrder = []

  steps.push({
    highlights: [startId],
    type: STEP_TYPES.VISIT,
    codeLine: 1,
    description: `Enqueue start node ${nodeLabel(nodes, startId)}`,
    state: {
      visited: [],
      queue: [...queue],
      current: null,
      exploredEdges: [],
      visitOrder: [],
    },
  })

  while (queue.length > 0) {
    const current = queue.shift()

    if (visited.has(current)) {
      steps.push({
        highlights: [current],
        type: STEP_TYPES.COMPARE,
        codeLine: 4,
        description: `Skip ${nodeLabel(nodes, current)} — already visited`,
        state: {
          visited: [...visited],
          queue: [...queue],
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
      codeLine: 5,
      description: `Visit ${nodeLabel(nodes, current)} — add to visited`,
      state: {
        visited: [...visited],
        queue: [...queue],
        current,
        exploredEdges: [...exploredEdges],
        visitOrder: [...visitOrder],
      },
    })

    const neighbors = adj.get(current) || []
    for (const { to, edge } of neighbors) {
      const key = edgeKey(edge.source, edge.target)
      exploredEdges.add(key)

      if (!visited.has(to) && !queue.includes(to)) {
        queue.push(to)
        steps.push({
          highlights: [current, to],
          type: STEP_TYPES.SET,
          codeLine: 7,
          description: `Enqueue ${nodeLabel(nodes, to)}`,
          state: {
            visited: [...visited],
            queue: [...queue],
            current,
            exploredEdges: [...exploredEdges],
            visitOrder: [...visitOrder],
          },
        })
      } else {
        steps.push({
          highlights: [current, to],
          type: STEP_TYPES.COMPARE,
          codeLine: 8,
          description: `${nodeLabel(nodes, to)} already seen — skip`,
          state: {
            visited: [...visited],
            queue: [...queue],
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
    description: `BFS complete — visited ${visitOrder.length} node${visitOrder.length === 1 ? '' : 's'}`,
    state: {
      visited: [...visited],
      queue: [],
      current: null,
      exploredEdges: [...exploredEdges],
      visitOrder: [...visitOrder],
    },
  })

  return steps
}

function nodeLabel(nodes, id) {
  const n = nodes.find((x) => x.id === id)
  return n?.label ?? String(id)
}

export const bfsMeta = {
  id: 'bfs',
  name: 'Breadth-First Search',
  category: 'graph',
  timeComplexity: 'O(V + E)',
  spaceComplexity: 'O(V)',
  bestCase: 'O(V + E)',
  worstCase: 'O(V + E)',
  stable: true,
  description:
    'Explores the graph level by level using a queue — visits all neighbors at the current depth before moving deeper.',
  code: {
    javascript: [
      'function bfs(graph, start) {',
      '  const visited = new Set();',
      '  const queue = [start];',
      '  while (queue.length > 0) {',
      '    const node = queue.shift();',
      '    if (visited.has(node)) continue;',
      '    visited.add(node);',
      '    for (const neighbor of graph[node]) {',
      '      if (!visited.has(neighbor)) queue.push(neighbor);',
      '    }',
      '  }',
      '  return visited;',
      '}',
    ],
    cpp: [
      'void bfs(vector<vector<int>>& graph, int start) {',
      '    unordered_set<int> visited;',
      '    queue<int> q;',
      '    q.push(start);',
      '    while (!q.empty()) {',
      '        int node = q.front(); q.pop();',
      '        if (visited.count(node)) continue;',
      '        visited.insert(node);',
      '        for (int nb : graph[node])',
      '            if (!visited.count(nb)) q.push(nb);',
      '    }',
      '}',
    ],
    c: [
      'void bfs(int graph[][N], int n, int start) {',
      '    int visited[N] = {0};',
      '    int queue[N], front = 0, back = 0;',
      '    queue[back++] = start;',
      '    while (front < back) {',
      '        int node = queue[front++];',
      '        if (visited[node]) continue;',
      '        visited[node] = 1;',
      '        for (int i = 0; i < n; i++)',
      '            if (graph[node][i] && !visited[i])',
      '                queue[back++] = i;',
      '    }',
      '}',
    ],
    python: [
      'from collections import deque',
      '',
      'def bfs(graph, start):',
      '    visited = set()',
      '    queue = deque([start])',
      '    while queue:',
      '        node = queue.popleft()',
      '        if node in visited: continue',
      '        visited.add(node)',
      '        for nb in graph[node]:',
      '            if nb not in visited:',
      '                queue.append(nb)',
      '    return visited',
    ],
    java: [
      'void bfs(Map<Integer,List<Integer>> graph, int start) {',
      '    Set<Integer> visited = new HashSet<>();',
      '    Queue<Integer> q = new LinkedList<>();',
      '    q.add(start);',
      '    while (!q.isEmpty()) {',
      '        int node = q.poll();',
      '        if (visited.contains(node)) continue;',
      '        visited.add(node);',
      '        for (int nb : graph.get(node))',
      '            if (!visited.contains(nb)) q.add(nb);',
      '    }',
      '}',
    ],
  },
}
