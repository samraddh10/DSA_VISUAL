import { STEP_TYPES } from '../../../engine/types.js'

function clone2D(t) {
  return t.map((row) => [...row])
}

export default function knapsack(items, capacity) {
  const steps = []
  const n = items.length
  const W = capacity

  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0))

  const dims = [n + 1, W + 1]
  const rowLabels = ['∅', ...items.map((it, i) => `${i + 1}(w${it.weight}/v${it.value})`)]
  const colLabels = Array.from({ length: W + 1 }, (_, w) => String(w))

  steps.push({
    highlights: [],
    type: STEP_TYPES.SET,
    codeLine: 1,
    description: `Initialize dp table (${n + 1} × ${W + 1}) with zeros`,
    state: {
      table: clone2D(dp),
      currentCell: null,
      dependencies: [],
      dims,
      rowLabels,
      colLabels,
      answer: null,
      chosenItems: [],
    },
  })

  for (let i = 1; i <= n; i++) {
    const { weight: wi, value: vi } = items[i - 1]
    for (let w = 0; w <= W; w++) {
      steps.push({
        highlights: [],
        type: STEP_TYPES.COMPARE,
        codeLine: 3,
        description: `Consider item ${i} (w=${wi}, v=${vi}) with capacity ${w}`,
        state: {
          table: clone2D(dp),
          currentCell: [i, w],
          dependencies: [[i - 1, w]],
          dims,
          rowLabels,
          colLabels,
          answer: null,
          chosenItems: [],
        },
      })

      if (wi > w) {
        dp[i][w] = dp[i - 1][w]
        steps.push({
          highlights: [],
          type: STEP_TYPES.SET,
          codeLine: 4,
          description: `Item too heavy (${wi} > ${w}) — skip: dp[${i}][${w}] = dp[${i - 1}][${w}] = ${dp[i][w]}`,
          state: {
            table: clone2D(dp),
            currentCell: [i, w],
            dependencies: [[i - 1, w]],
            dims,
            rowLabels,
            colLabels,
            answer: null,
            chosenItems: [],
          },
        })
      } else {
        const skip = dp[i - 1][w]
        const take = dp[i - 1][w - wi] + vi
        dp[i][w] = Math.max(skip, take)

        steps.push({
          highlights: [],
          type: STEP_TYPES.SET,
          codeLine: 6,
          description: `max(skip=${skip}, take=${dp[i - 1][w - wi]}+${vi}=${take}) = ${dp[i][w]}`,
          state: {
            table: clone2D(dp),
            currentCell: [i, w],
            dependencies: [
              [i - 1, w],
              [i - 1, w - wi],
            ],
            dims,
            rowLabels,
            colLabels,
            answer: null,
            chosenItems: [],
          },
        })
      }
    }
  }

  const chosen = []
  let w = W
  for (let i = n; i > 0 && w > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      chosen.push(i - 1)
      w -= items[i - 1].weight
    }
  }
  chosen.reverse()

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 9,
    description: `Max value: ${dp[n][W]} — items ${chosen.map((i) => i + 1).join(', ') || 'none'}`,
    state: {
      table: clone2D(dp),
      currentCell: [n, W],
      dependencies: [],
      dims,
      rowLabels,
      colLabels,
      answer: dp[n][W],
      chosenItems: chosen,
    },
  })

  return steps
}

export const knapsackMeta = {
  id: 'knapsack',
  name: '0/1 Knapsack',
  category: 'dp',
  timeComplexity: 'O(n·W)',
  spaceComplexity: 'O(n·W)',
  bestCase: 'O(n·W)',
  worstCase: 'O(n·W)',
  stable: true,
  description:
    'Given items with weights and values, maximize total value without exceeding capacity W. Each item can be taken at most once.',
  code: {
    javascript: [
      'function knapsack(items, W) {',
      '  const n = items.length;',
      '  const dp = Array.from({length:n+1},()=>new Array(W+1).fill(0));',
      '  for (let i = 1; i <= n; i++) {',
      '    for (let w = 0; w <= W; w++) {',
      '      if (items[i-1].weight > w) {',
      '        dp[i][w] = dp[i-1][w];',
      '      } else {',
      '        dp[i][w] = Math.max(',
      '          dp[i-1][w],',
      '          dp[i-1][w-items[i-1].weight] + items[i-1].value',
      '        );',
      '      }',
      '    }',
      '  }',
      '  return dp[n][W];',
      '}',
    ],
    cpp: [
      'int knapsack(vector<pair<int,int>>& items, int W) {',
      '    int n = items.size();',
      '    vector<vector<int>> dp(n+1, vector<int>(W+1, 0));',
      '    for (int i = 1; i <= n; i++) {',
      '        for (int w = 0; w <= W; w++) {',
      '            if (items[i-1].first > w)',
      '                dp[i][w] = dp[i-1][w];',
      '            else',
      '                dp[i][w] = max(dp[i-1][w],',
      '                    dp[i-1][w-items[i-1].first] + items[i-1].second);',
      '        }',
      '    }',
      '    return dp[n][W];',
      '}',
    ],
    c: [
      'int knapsack(int wt[], int val[], int n, int W) {',
      '    int dp[n+1][W+1];',
      '    for (int i = 0; i <= n; i++) dp[i][0] = 0;',
      '    for (int w = 0; w <= W; w++) dp[0][w] = 0;',
      '    for (int i = 1; i <= n; i++) {',
      '        for (int w = 0; w <= W; w++) {',
      '            if (wt[i-1] > w)',
      '                dp[i][w] = dp[i-1][w];',
      '            else {',
      '                int skip = dp[i-1][w];',
      '                int take = dp[i-1][w-wt[i-1]] + val[i-1];',
      '                dp[i][w] = skip > take ? skip : take;',
      '            }',
      '        }',
      '    }',
      '    return dp[n][W];',
      '}',
    ],
    python: [
      'def knapsack(items, W):',
      '    n = len(items)',
      '    dp = [[0]*(W+1) for _ in range(n+1)]',
      '    for i in range(1, n+1):',
      '        for w in range(W+1):',
      '            wt, val = items[i-1]',
      '            if wt > w:',
      '                dp[i][w] = dp[i-1][w]',
      '            else:',
      '                dp[i][w] = max(',
      '                    dp[i-1][w],',
      '                    dp[i-1][w-wt] + val',
      '                )',
      '    return dp[n][W]',
    ],
    java: [
      'int knapsack(int[] wt, int[] val, int W) {',
      '    int n = wt.length;',
      '    int[][] dp = new int[n+1][W+1];',
      '    for (int i = 1; i <= n; i++) {',
      '        for (int w = 0; w <= W; w++) {',
      '            if (wt[i-1] > w) dp[i][w] = dp[i-1][w];',
      '            else dp[i][w] = Math.max(',
      '                dp[i-1][w],',
      '                dp[i-1][w-wt[i-1]] + val[i-1]',
      '            );',
      '        }',
      '    }',
      '    return dp[n][W];',
      '}',
    ],
  },
}
