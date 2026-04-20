import { STEP_TYPES } from '../../../engine/types.js'

function clone2D(t) {
  return t.map((row) => [...row])
}

export default function lcs(str1, str2) {
  const steps = []
  const a = str1 || ''
  const b = str2 || ''
  const m = a.length
  const n = b.length

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  const dims = [m + 1, n + 1]
  const rowLabels = ['∅', ...a.split('')]
  const colLabels = ['∅', ...b.split('')]

  steps.push({
    highlights: [],
    type: STEP_TYPES.SET,
    codeLine: 1,
    description: `Initialize dp table (${m + 1} × ${n + 1}) with zeros`,
    state: {
      table: clone2D(dp),
      currentCell: null,
      dependencies: [],
      dims,
      rowLabels,
      colLabels,
      answer: null,
      pathCells: [],
      lcsString: '',
    },
  })

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const charA = a[i - 1]
      const charB = b[j - 1]

      steps.push({
        highlights: [],
        type: STEP_TYPES.COMPARE,
        codeLine: 3,
        description: `Compare "${charA}" and "${charB}"`,
        state: {
          table: clone2D(dp),
          currentCell: [i, j],
          dependencies: [],
          dims,
          rowLabels,
          colLabels,
          answer: null,
          pathCells: [],
          lcsString: '',
        },
      })

      if (charA === charB) {
        dp[i][j] = dp[i - 1][j - 1] + 1
        steps.push({
          highlights: [],
          type: STEP_TYPES.INSERT,
          codeLine: 4,
          description: `Match! dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}`,
          state: {
            table: clone2D(dp),
            currentCell: [i, j],
            dependencies: [[i - 1, j - 1]],
            dims,
            rowLabels,
            colLabels,
            answer: null,
            pathCells: [],
            lcsString: '',
          },
        })
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        steps.push({
          highlights: [],
          type: STEP_TYPES.SET,
          codeLine: 6,
          description: `No match. dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}`,
          state: {
            table: clone2D(dp),
            currentCell: [i, j],
            dependencies: [
              [i - 1, j],
              [i, j - 1],
            ],
            dims,
            rowLabels,
            colLabels,
            answer: null,
            pathCells: [],
            lcsString: '',
          },
        })
      }
    }
  }

  // Reconstruct LCS
  const pathCells = []
  const chars = []
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      chars.push(a[i - 1])
      pathCells.push([i, j])
      i--
      j--
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }
  chars.reverse()
  const lcsStr = chars.join('')

  steps.push({
    highlights: [],
    type: STEP_TYPES.DONE,
    codeLine: 9,
    description: `LCS length: ${dp[m][n]} — "${lcsStr}"`,
    state: {
      table: clone2D(dp),
      currentCell: [m, n],
      dependencies: [],
      dims,
      rowLabels,
      colLabels,
      answer: dp[m][n],
      pathCells,
      lcsString: lcsStr,
    },
  })

  return steps
}

export const lcsMeta = {
  id: 'lcs',
  name: 'Longest Common Subsequence',
  category: 'dp',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  bestCase: 'O(m·n)',
  worstCase: 'O(m·n)',
  stable: true,
  description:
    'Find the length of the longest subsequence present in both strings. A subsequence preserves order but need not be contiguous.',
  code: {
    javascript: [
      'function lcs(a, b) {',
      '  const m = a.length, n = b.length;',
      '  const dp = Array.from({length:m+1},()=>new Array(n+1).fill(0));',
      '  for (let i = 1; i <= m; i++) {',
      '    for (let j = 1; j <= n; j++) {',
      '      if (a[i-1] === b[j-1]) {',
      '        dp[i][j] = dp[i-1][j-1] + 1;',
      '      } else {',
      '        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);',
      '      }',
      '    }',
      '  }',
      '  return dp[m][n];',
      '}',
    ],
    cpp: [
      'int lcs(string& a, string& b) {',
      '    int m = a.size(), n = b.size();',
      '    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));',
      '    for (int i = 1; i <= m; i++) {',
      '        for (int j = 1; j <= n; j++) {',
      '            if (a[i-1] == b[j-1])',
      '                dp[i][j] = dp[i-1][j-1] + 1;',
      '            else',
      '                dp[i][j] = max(dp[i-1][j], dp[i][j-1]);',
      '        }',
      '    }',
      '    return dp[m][n];',
      '}',
    ],
    c: [
      'int lcs(char *a, char *b, int m, int n) {',
      '    int dp[m+1][n+1];',
      '    for (int i = 0; i <= m; i++) dp[i][0] = 0;',
      '    for (int j = 0; j <= n; j++) dp[0][j] = 0;',
      '    for (int i = 1; i <= m; i++) {',
      '        for (int j = 1; j <= n; j++) {',
      '            if (a[i-1] == b[j-1])',
      '                dp[i][j] = dp[i-1][j-1] + 1;',
      '            else',
      '                dp[i][j] = dp[i-1][j] > dp[i][j-1]',
      '                    ? dp[i-1][j] : dp[i][j-1];',
      '        }',
      '    }',
      '    return dp[m][n];',
      '}',
    ],
    python: [
      'def lcs(a, b):',
      '    m, n = len(a), len(b)',
      '    dp = [[0]*(n+1) for _ in range(m+1)]',
      '    for i in range(1, m+1):',
      '        for j in range(1, n+1):',
      '            if a[i-1] == b[j-1]:',
      '                dp[i][j] = dp[i-1][j-1] + 1',
      '            else:',
      '                dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
      '    return dp[m][n]',
    ],
    java: [
      'int lcs(String a, String b) {',
      '    int m = a.length(), n = b.length();',
      '    int[][] dp = new int[m+1][n+1];',
      '    for (int i = 1; i <= m; i++) {',
      '        for (int j = 1; j <= n; j++) {',
      '            if (a.charAt(i-1) == b.charAt(j-1))',
      '                dp[i][j] = dp[i-1][j-1] + 1;',
      '            else',
      '                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);',
      '        }',
      '    }',
      '    return dp[m][n];',
      '}',
    ],
  },
}
