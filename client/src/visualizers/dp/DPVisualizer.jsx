import { motion } from 'framer-motion'

const CELL_W = 48
const CELL_H = 40

const CELL_COLORS = {
  default: 'bg-slate-950/40 border-slate-700/40 text-slate-300',
  filled: 'bg-purple-950/50 border-purple-500/30 text-purple-200',
  current: 'bg-amber-500/30 border-amber-400/70 text-amber-100 ring-2 ring-amber-400/50',
  dependency: 'bg-cyan-600/25 border-cyan-500/50 text-cyan-200',
  path: 'bg-green-500/25 border-green-400/60 text-green-100',
  answer: 'bg-rose-500/30 border-rose-400/70 text-rose-100',
}

function cellKey(r, c) {
  return `${r},${c}`
}

export default function DPVisualizer({ currentStep }) {
  const state = currentStep?.state || {}
  const table = state.table
  const currentCell = state.currentCell
  const chosenItems = state.chosenItems
  const rowLabels = state.rowLabels
  const colLabels = state.colLabels
  const answer = state.answer
  const lcsString = state.lcsString

  const depSet = new Set()
  for (const c of state.dependencies || []) depSet.add(cellKey(c[0], c[1] ?? 0))

  const pathSet = new Set()
  for (const c of state.pathCells || []) pathSet.add(cellKey(c[0], c[1] ?? 0))

  if (!table || table.length === 0) {
    return (
      <div className="relative h-64 bg-slate-950/50 rounded-lg border border-purple-500/20 p-6 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />
        <p className="text-text-muted text-sm font-mono relative z-10">
          No table — configure input to begin
        </p>
      </div>
    )
  }

  const is1D = !Array.isArray(table[0])

  if (is1D) {
    return (
      <div className="relative bg-slate-950/50 rounded-lg border border-purple-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />
        <div className="p-6 space-y-4 relative">
          <div className="flex gap-1.5 flex-wrap justify-center">
            {table.map((v, i) => {
              const isCurrent = currentCell?.[0] === i
              const isDep = depSet.has(cellKey(i, 0))
              const isAnswer = answer !== null && i === table.length - 1 && !isCurrent
              const cls = isAnswer
                ? CELL_COLORS.answer
                : isCurrent
                  ? CELL_COLORS.current
                  : isDep
                    ? CELL_COLORS.dependency
                    : v !== null
                      ? CELL_COLORS.filled
                      : CELL_COLORS.default

              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-mono">i={i}</span>
                  <motion.div
                    layout
                    className={`flex items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-colors ${cls}`}
                    style={{ width: CELL_W, height: CELL_H }}
                    animate={{ scale: isCurrent ? 1.08 : 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {v === null ? '—' : v}
                  </motion.div>
                </div>
              )
            })}
          </div>
          {answer !== null && (
            <div className="text-center pt-2">
              <span className="text-sm text-slate-400">
                Result:{' '}
                <span className="text-rose-300 font-mono font-bold text-lg">{answer}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 2D table
  const rows = table.length
  const cols = table[0].length

  return (
    <div className="relative bg-slate-950/50 rounded-lg border border-purple-500/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />
      <div className="p-4 overflow-auto relative" style={{ maxHeight: '460px' }}>
        <table className="mx-auto border-separate" style={{ borderSpacing: '4px' }}>
          <thead>
            <tr>
              <th />
              {colLabels?.map((cl, j) => (
                <th
                  key={`col-${j}`}
                  className="text-xs text-cyan-300 font-mono font-semibold pb-1"
                  style={{ width: CELL_W }}
                >
                  {cl}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr key={`r-${i}`}>
                <td
                  className="text-xs text-cyan-300 font-mono font-semibold pr-2 text-right whitespace-nowrap"
                >
                  {rowLabels?.[i] ?? i}
                </td>
                {row.map((v, j) => {
                  const isCurrent = currentCell?.[0] === i && currentCell?.[1] === j
                  const isDep = depSet.has(cellKey(i, j))
                  const isPath = pathSet.has(cellKey(i, j))
                  const isAnswer = answer !== null && i === rows - 1 && j === cols - 1 && !isCurrent
                  const cls = isAnswer
                    ? CELL_COLORS.answer
                    : isCurrent
                      ? CELL_COLORS.current
                      : isPath
                        ? CELL_COLORS.path
                        : isDep
                          ? CELL_COLORS.dependency
                          : v > 0
                            ? CELL_COLORS.filled
                            : CELL_COLORS.default
                  return (
                    <td key={`c-${i}-${j}`}>
                      <motion.div
                        className={`flex items-center justify-center rounded-md border font-mono text-sm font-semibold transition-colors ${cls}`}
                        style={{ width: CELL_W, height: CELL_H }}
                        animate={{ scale: isCurrent ? 1.08 : 1 }}
                        transition={{ duration: 0.15 }}
                      >
                        {v}
                      </motion.div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(answer !== null || lcsString || (chosenItems && chosenItems.length > 0)) && (
        <div className="px-4 pb-3 pt-2 border-t border-purple-500/10 flex flex-wrap items-center gap-3">
          {answer !== null && (
            <span className="text-sm text-slate-400">
              Result:{' '}
              <span className="text-rose-300 font-mono font-bold text-base">{answer}</span>
            </span>
          )}
          {lcsString !== undefined && lcsString.length > 0 && (
            <span className="text-sm text-slate-400">
              LCS:{' '}
              <span className="text-purple-300 font-mono font-bold">"{lcsString}"</span>
            </span>
          )}
          {chosenItems && chosenItems.length > 0 && (
            <span className="text-sm text-slate-400">
              Items:{' '}
              <span className="text-green-300 font-mono font-bold">
                {chosenItems.map((i) => i + 1).join(', ')}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
