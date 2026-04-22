import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Flame,
  Trophy,
  ArrowUpDown,
  LayoutGrid,
  Link2,
  GitBranch,
  Share2,
  AlignJustify,
  Type,
  ChevronRight,
} from 'lucide-react'
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx'
import {
  TOPICS,
  findTopic,
  findSubtopic,
  generateQuiz,
  loadHighScore,
  saveHighScore,
} from '../lib/quizBank.js'

const QUESTION_COUNT = 10

const ICONS = {
  ArrowUpDown,
  LayoutGrid,
  Link2,
  GitBranch,
  Share2,
  AlignJustify,
  Type,
}

const ACCENT_STYLES = {
  purple: {
    icon: 'text-purple-300',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-400/70',
    glow: 'hover:shadow-[0_0_22px_rgba(168,85,247,0.25)]',
  },
  blue: {
    icon: 'text-blue-300',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-400/70',
    glow: 'hover:shadow-[0_0_22px_rgba(59,130,246,0.25)]',
  },
  rose: {
    icon: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    hoverBorder: 'hover:border-rose-400/70',
    glow: 'hover:shadow-[0_0_22px_rgba(244,63,94,0.25)]',
  },
  green: {
    icon: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-400/70',
    glow: 'hover:shadow-[0_0_22px_rgba(16,185,129,0.25)]',
  },
  amber: {
    icon: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-400/70',
    glow: 'hover:shadow-[0_0_22px_rgba(245,158,11,0.25)]',
  },
  cyan: {
    icon: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    hoverBorder: 'hover:border-cyan-400/70',
    glow: 'hover:shadow-[0_0_22px_rgba(34,211,238,0.25)]',
  },
}

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

function PageHeader({ stage, topic, subtopic, onBack }) {
  const crumb =
    stage === 'topic'
      ? 'Choose a topic'
      : stage === 'subtopic'
      ? `${topic?.label} · pick a subtopic`
      : `${topic?.label} › ${subtopic?.label}`

  return (
    <div className="flex items-start gap-4">
      {stage !== 'topic' && (
        <button
          onClick={onBack}
          className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/60 border border-slate-700 hover:border-purple-400/60 hover:text-purple-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      )}
      <div className="flex-1">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-400" />
          Quiz
        </h1>
        <p className="text-slate-400 mt-2">{crumb}</p>
      </div>
    </div>
  )
}

function TopicGrid({ onPick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {TOPICS.map((topic) => {
        const Icon = ICONS[topic.iconName] || Brain
        const accent = ACCENT_STYLES[topic.accent] || ACCENT_STYLES.purple
        return (
          <button
            key={topic.id}
            onClick={() => onPick(topic.id)}
            className={`group text-left p-5 rounded-2xl border bg-slate-900/50 backdrop-blur-sm transition-all duration-200 cursor-pointer ${accent.border} ${accent.hoverBorder} ${accent.glow}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent.bg} border ${accent.border}`}
              >
                <Icon className={`w-5 h-5 ${accent.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-100">
                    {topic.label}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </div>
                <p className="text-sm text-slate-400 mt-1 leading-snug">
                  {topic.description}
                </p>
                <div className="mt-3 text-xs text-slate-500 font-mono uppercase tracking-wider">
                  {topic.subtopics.length} subtopic
                  {topic.subtopics.length === 1 ? '' : 's'}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </motion.div>
  )
}

function SubtopicGrid({ topic, onPick }) {
  const accent = ACCENT_STYLES[topic.accent] || ACCENT_STYLES.purple
  const Icon = ICONS[topic.iconName] || Brain
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {topic.subtopics.map((sub) => (
        <button
          key={sub.id}
          onClick={() => onPick(sub.id)}
          className={`group text-left p-5 rounded-2xl border bg-slate-900/50 backdrop-blur-sm transition-all duration-200 cursor-pointer ${accent.border} ${accent.hoverBorder} ${accent.glow}`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent.bg} border ${accent.border}`}
            >
              <Icon className={`w-5 h-5 ${accent.icon}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">
                  {sub.label}
                </h3>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </div>
              <div className="mt-3 text-xs text-slate-500 font-mono uppercase tracking-wider">
                {QUESTION_COUNT} questions
              </div>
            </div>
          </div>
        </button>
      ))}
    </motion.div>
  )
}

function QuizRunner({ topic, subtopic, onChangeSubtopic, onChangeTopic }) {
  const [questions, setQuestions] = useState(() =>
    generateQuiz(topic.id, subtopic.id, QUESTION_COUNT)
  )
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [highScore, setHighScore] = useState(() =>
    loadHighScore(topic.id, subtopic.id)
  )
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
      saveHighScore(topic.id, subtopic.id, score)
      setHighScore(loadHighScore(topic.id, subtopic.id))
    } else {
      setIndex((i) => i + 1)
      setSelected(null)
    }
  }, [index, questions.length, score, topic.id, subtopic.id])

  const handleRestart = useCallback(() => {
    setQuestions(generateQuiz(topic.id, subtopic.id, QUESTION_COUNT))
    setIndex(0)
    setSelected(null)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setFinished(false)
  }, [topic.id, subtopic.id])

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
    () => (totalAnswered / Math.max(1, questions.length)) * 100,
    [totalAnswered, questions.length]
  )

  if (!questions.length) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-rose-500/30 rounded-2xl p-6 text-center text-slate-300">
        <p className="mb-4">
          Couldn't generate questions for this subtopic. Pick another.
        </p>
        <button
          onClick={onChangeSubtopic}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Change subtopic
        </button>
      </div>
    )
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-slate-900/70 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 text-center space-y-5"
      >
        <Trophy className="w-14 h-14 text-amber-400 mx-auto" />
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Quiz complete</h2>
          <p className="text-slate-400 mt-1">
            {topic.label} › {subtopic.label}
          </p>
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
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Play again
          </button>
          <button
            onClick={onChangeSubtopic}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-200 bg-slate-800/80 border border-slate-700 hover:border-purple-400/60 transition-colors cursor-pointer"
          >
            Change subtopic
          </button>
          <button
            onClick={onChangeTopic}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-200 bg-slate-800/80 border border-slate-700 hover:border-purple-400/60 transition-colors cursor-pointer"
          >
            Change topic
          </button>
        </div>
      </motion.div>
    )
  }

  if (!current) return null

  const isAnswered = selected !== null
  const isCorrect = isAnswered && selected === current.correctIndex

  return (
    <div className="space-y-5">
      <p className="text-slate-400 -mt-2">
        Predict the next step. Press 1-4 to answer, Enter to continue.
      </p>

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
  )
}

function QuizInner() {
  const [topicId, setTopicId] = useState(null)
  const [subtopicId, setSubtopicId] = useState(null)

  const topic = topicId ? findTopic(topicId) : null
  const subtopic = topicId && subtopicId ? findSubtopic(topicId, subtopicId) : null

  const stage = !topic ? 'topic' : !subtopic ? 'subtopic' : 'quiz'

  const handleBack = useCallback(() => {
    if (stage === 'quiz') setSubtopicId(null)
    else if (stage === 'subtopic') setTopicId(null)
  }, [stage])

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          stage={stage}
          topic={topic}
          subtopic={subtopic}
          onBack={handleBack}
        />

        {stage === 'topic' && <TopicGrid onPick={setTopicId} />}
        {stage === 'subtopic' && topic && (
          <SubtopicGrid topic={topic} onPick={setSubtopicId} />
        )}
        {stage === 'quiz' && topic && subtopic && (
          <QuizRunner
            key={`${topic.id}:${subtopic.id}`}
            topic={topic}
            subtopic={subtopic}
            onChangeSubtopic={() => setSubtopicId(null)}
            onChangeTopic={() => {
              setSubtopicId(null)
              setTopicId(null)
            }}
          />
        )}
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
