import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Check,
  X,
  ArrowRight,
  RefreshCw,
  Flame,
  Trophy,
} from 'lucide-react'
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx'
import {
  generateQuiz,
  loadHighScore,
  saveHighScore,
} from '../lib/quizBank.js'

const QUESTION_COUNT = 10

function ArrayPreview({ values, highlights = [] }) {
  const highlightSet = new Set(highlights)
  return (
    <div className="flex flex-wrap gap-1.5 justify-center p-3 bg-slate-950/60 rounded-lg border border-slate-800">
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex flex-col items-center justify-center min-w-[40px] h-14 px-2 rounded-md text-sm font-mono border transition-colors ${
            highlightSet.has(i)
              ? 'bg-purple-500/30 border-purple-400 text-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
              : 'bg-slate-800/60 border-slate-700 text-slate-300'
          }`}
        >
          <span className="font-semibold">{v}</span>
          <span className="text-[10px] text-slate-500 font-mono">[{i}]</span>
        </div>
      ))}
    </div>
  )
}

function AdjacencyPreview({ lines }) {
  return (
    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 font-mono text-sm text-slate-300 space-y-0.5">
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  )
}

function QuizInner() {
  const [questions, setQuestions] = useState(() => generateQuiz(QUESTION_COUNT))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [highScore, setHighScore] = useState(() => loadHighScore())
  const [finished, setFinished] = useState(false)
  const liveRegionRef = useRef(null)

  const current = questions[index]
  const totalAnswered = selected !== null ? index + 1 : index

  const handleSelect = useCallback(
    (choiceIdx) => {
      if (selected !== null || finished) return
      setSelected(choiceIdx)
      const isCorrect = choiceIdx === current.correctIndex
      if (isCorrect) {
        setScore((s) => s + 1)
        setStreak((s) => {
          const next = s + 1
          setBestStreak((b) => Math.max(b, next))
          return next
        })
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = 'Correct'
        }
      } else {
        setStreak(0)
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = `Incorrect. ${current.explanation}`
        }
      }
    },
    [selected, finished, current]
  )

  const handleNext = useCallback(() => {
    if (index + 1 >= questions.length) {
      setFinished(true)
      saveHighScore(score)
      setHighScore(loadHighScore())
    } else {
      setIndex((i) => i + 1)
      setSelected(null)
    }
  }, [index, questions.length, score])

  const handleRestart = useCallback(() => {
    setQuestions(generateQuiz(QUESTION_COUNT))
    setIndex(0)
    setSelected(null)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setFinished(false)
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (finished) return
      if (selected === null) {
        const n = parseInt(e.key, 10)
        if (Number.isInteger(n) && n >= 1 && n <= 4 && current) {
          if (n - 1 < current.choices.length) handleSelect(n - 1)
        }
      } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
        handleNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, current, handleSelect, handleNext, finished])

  const progress = useMemo(
    () => (totalAnswered / questions.length) * 100,
    [totalAnswered, questions.length]
  )

  if (finished) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900/70 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 text-center space-y-5"
        >
          <Trophy className="w-14 h-14 text-amber-400 mx-auto" />
          <div>
            <h2 className="text-3xl font-bold text-slate-100">Quiz complete</h2>
            <p className="text-slate-400 mt-1">Well played.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950/50 rounded-lg p-3 border border-purple-500/20">
              <div className="text-xs text-slate-400 uppercase tracking-wider">
                Score
              </div>
              <div className="text-2xl font-bold text-purple-200">
                {score} / {questions.length}
              </div>
            </div>
            <div className="bg-slate-950/50 rounded-lg p-3 border border-orange-500/20">
              <div className="text-xs text-slate-400 uppercase tracking-wider">
                Best streak
              </div>
              <div className="text-2xl font-bold text-orange-200">
                {bestStreak}
              </div>
            </div>
            <div className="bg-slate-950/50 rounded-lg p-3 border border-amber-500/20">
              <div className="text-xs text-slate-400 uppercase tracking-wider">
                High score
              </div>
              <div className="text-2xl font-bold text-amber-200">{highScore}</div>
            </div>
          </div>
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Play again
          </button>
        </motion.div>
      </div>
    )
  }

  if (!current) return null

  const isAnswered = selected !== null
  const isCorrect = isAnswered && selected === current.correctIndex

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Quiz
          </h1>
          <p className="text-slate-400 mt-2">
            Predict the next step. Press 1-4 to answer, Enter to continue.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] bg-slate-900/50 border border-purple-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="uppercase tracking-wider">Progress</span>
              <span className="font-mono">
                {totalAnswered} / {questions.length}
              </span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 border border-orange-500/20 rounded-lg px-4 py-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              Streak
            </span>
            <span className="text-lg font-bold text-orange-200 font-mono">
              {streak}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 border border-purple-500/20 rounded-lg px-4 py-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              Score
            </span>
            <span className="text-lg font-bold text-purple-200 font-mono">
              {score}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-200 font-medium uppercase tracking-wider">
                {current.category}
              </span>
              <span className="text-slate-500 font-mono">
                Question {index + 1}
              </span>
            </div>

            <p className="text-lg text-slate-100 leading-relaxed">
              {current.prompt}
            </p>

            {current.arrayPreview && (
              <ArrayPreview
                values={current.arrayPreview}
                highlights={current.highlights}
              />
            )}

            {current.adjacency && <AdjacencyPreview lines={current.adjacency} />}

            <div className="grid sm:grid-cols-2 gap-3">
              {current.choices.map((choice, i) => {
                const isChosen = selected === i
                const isRight = i === current.correctIndex
                let classes =
                  'text-left p-4 rounded-lg border text-sm transition-colors cursor-pointer flex items-center gap-3'
                if (!isAnswered) {
                  classes +=
                    ' bg-slate-950/50 border-slate-700 text-slate-200 hover:border-purple-400 hover:bg-slate-900/70'
                } else if (isRight) {
                  classes +=
                    ' bg-emerald-500/15 border-emerald-500/50 text-emerald-100'
                } else if (isChosen) {
                  classes += ' bg-rose-500/15 border-rose-500/50 text-rose-100'
                } else {
                  classes += ' bg-slate-950/30 border-slate-800 text-slate-500'
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={isAnswered}
                    className={classes}
                  >
                    <span className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1">{choice}</span>
                    {isAnswered && isRight && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isChosen && !isRight && (
                      <X className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>

            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg p-4 border ${
                  isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-100'
                }`}
              >
                <div className="font-semibold mb-1">
                  {isCorrect ? 'Correct!' : 'Not quite.'}
                </div>
                <div className="text-sm text-slate-200/90">
                  {current.explanation}
                </div>
              </motion.div>
            )}

            {isAnswered && (
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 transition-colors cursor-pointer"
                >
                  {index + 1 >= questions.length ? 'Finish' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div
          ref={liveRegionRef}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </div>
    </div>
  )
}

export default function QuizPage() {
  return (
    <ErrorBoundary>
      <QuizInner />
    </ErrorBoundary>
  )
}
