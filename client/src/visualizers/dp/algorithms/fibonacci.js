import { STEP_TYPES } from '../../../engine/types.js'

export default function fibonacci(n) {
  const steps = []
  const N = Math.max(0, Math.min(n, 20))

  const dp = new Array(N + 1).fill(null)

  const snapshot = () => [...dp]

  steps.push({
    highlights: [],
    type: STEP_TYPES.SET,
    codeLine: 1,
    description: `Initialize dp array of size ${N + 1}`,
    state: {
      table: snapshot(),
      currentCell: null,
      dependencies: [],
      dims: [N + 1],
      answer: null,
    },
  })

  if (N >= 0) {
    dp[0] = 0
    steps.push({
      highlights: [0],
      type: STEP_TYPES.INSERT,
      codeLine: 2,
      description: `Base case: dp[0] = 0`,
      state: {
        table: snapshot(),
        currentCell: [0],
        dependencies: [],
        dims: [N + 1],
        answer: null,
      },
    })
  }

  if (N >= 1) {
    dp[1] = 1
    steps.push({
      highlights: [1],
      type: STEP_TYPES.INSERT,
      codeLine: 3,
      description: `Base case: dp[1] = 1`,
      state: {
        table: snapshot(),
        currentCell: [1],
        dependencies: [],
        dims: [N + 1],
        answer: null,
      },
    })
  }

  for (let i = 2; i <= N; i++) {
    steps.push({
      highlights: [i, i - 1, i - 2],
      type: STEP_TYPES.COMPARE,
      codeLine: 5,
      description: `Compute dp[${i}] = dp[${i - 1}] + dp[${i - 2}]`,
      state: {
        table: snapshot(),
        currentCell: [i],
        dependencies: [[i - 1], [i - 2]],
        dims: [N + 1],
        answer: null,
      },
    })

    dp[i] = dp[i - 1] + dp[i - 2]

    steps.push({
      highlights: [i],
      type: STEP_TYPES.SET,
      codeLine: 6,
      description: `dp[${i}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
      state: {
        table: snapshot(),
        currentCell: [i],
        dependencies: [[i - 1], [i - 2]],
        dims: [N + 1],
        answer: null,
      },
    })
  }

  steps.push({
    highlights: [N],
    type: STEP_TYPES.DONE,
    codeLine: 8,
    description: `F(${N}) = ${dp[N]}`,
    state: {
      table: snapshot(),
      currentCell: [N],
      dependencies: [],
      dims: [N + 1],
      answer: dp[N],
    },
  })

  return steps
}

export const fibonacciMeta = {
  id: 'fibonacci',
  name: 'Fibonacci',
  category: 'dp',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  bestCase: 'O(n)',
  worstCase: 'O(n)',
  stable: true,
  description:
    'Bottom-up DP: build up dp[i] = dp[i-1] + dp[i-2] using results from previous subproblems.',
  code: {
    javascript: [
      'function fib(n) {',
      '  const dp = new Array(n + 1);',
      '  dp[0] = 0;',
      '  dp[1] = 1;',
      '  for (let i = 2; i <= n; i++) {',
      '    dp[i] = dp[i - 1] + dp[i - 2];',
      '  }',
      '  return dp[n];',
      '}',
    ],
    cpp: [
      'int fib(int n) {',
      '    vector<int> dp(n + 1);',
      '    dp[0] = 0;',
      '    dp[1] = 1;',
      '    for (int i = 2; i <= n; i++) {',
      '        dp[i] = dp[i - 1] + dp[i - 2];',
      '    }',
      '    return dp[n];',
      '}',
    ],
    c: [
      'int fib(int n) {',
      '    int dp[n + 1];',
      '    dp[0] = 0;',
      '    dp[1] = 1;',
      '    for (int i = 2; i <= n; i++) {',
      '        dp[i] = dp[i - 1] + dp[i - 2];',
      '    }',
      '    return dp[n];',
      '}',
    ],
    python: [
      'def fib(n):',
      '    dp = [0] * (n + 1)',
      '    dp[0] = 0',
      '    dp[1] = 1',
      '    for i in range(2, n + 1):',
      '        dp[i] = dp[i - 1] + dp[i - 2]',
      '    return dp[n]',
    ],
    java: [
      'int fib(int n) {',
      '    int[] dp = new int[n + 1];',
      '    dp[0] = 0;',
      '    dp[1] = 1;',
      '    for (int i = 2; i <= n; i++) {',
      '        dp[i] = dp[i - 1] + dp[i - 2];',
      '    }',
      '    return dp[n];',
      '}',
    ],
  },
}
