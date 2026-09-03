import { useState } from 'react'
import { useStore, isToday, todayStr } from '../store.jsx'
import TaskCard from '../components/TaskCard.jsx'
import AddTask from '../components/AddTask.jsx'
import TwoMinTimer from '../components/TwoMinTimer.jsx'
import { daysUntil, prettyToday } from '../lib/date.js'
import { todayChallenge } from '../lib/challenges.js'

const KINDS = [
  { id: 'idea', label: '💡 Idée', hint: 'à développer' },
  { id: 'fact', label: '✓ Fait', hint: 'je viens de faire' },
  { id: 'synchro', label: '✦ Remarqué', hint: 'signe / ressenti' },
  { id: 'note', label: '📝 Note', hint: 'en vrac' },
]
const MOODS = ['🌑', '🌘', '🌗', '🌖', '🌕']

// ① AUJOURD'HUI — le rituel du jour en un seul écran : intention → mouvement → bilan.
export default function Today() {
  const { state, dispatch } = useStore()
  const [kind, setKind] = useState('idea')
  const [text, setText] = useState('')
  const existingReview = state.reviews.find((r) => r.date === todayStr())
  const [noticed, setNoticed] = useState(existingReview?.noticed ?? '')
  const [mood, setMood] = useState(existingReview?.mood ?? null)

  const wishes = state.tasks.filter((t) => t.type === 'wish' && t.status === 'open')
  const chosen = wishes.find((w) => w.id === state.intentionOfDay.wishId)
  const challenge = todayChallenge()
  const challengeDone = state.acceptedChallenges[todayStr()] === challenge.id

  const openTodos = state.tasks
    .filter((t) => t.type === 'todo' && t.status === 'open')
    .sort((a, b) => (daysUntil(a.deadline) ?? 9999) - (daysUntil(b.deadline) ?? 9999))

  const todayCaptures = state.captures.filter((c) => isToday(c.date))
  const doneTasks = state.tasks.filter((t) => t.status === 'done' && isToday(t.completedAt))
  const facts = state.captures.filter((c) => c.kind === 'fact' && isToday(c.date))
  const accomplished = [...doneTasks.map((t) => t.title), ...facts.map((c) => c.content)]

  function addCapture(e) {
    e.preventDefault()
    if (!text.trim()) return
    dispatch({ type: 'capture', content: text, kind })
    setText('')
  }

  return (
    <div className="view">
      <header className="view-head">
        <p className="eyebrow">{prettyToday()}</p>
        <h1>Aujourd'hui</h1>
        <p className="lead">Décide, agis, fais le point. Le reste suit.</p>
      </header>

      {/* — Intention du jour — */}
      <section className="panel">
        <h2 className="panel-title">✦ Mon intention</h2>
        {chosen ? (
          <div className="intention-chosen">
            <span className="intention-text">{chosen.title}</span>
            <button className="link-btn" onClick={() => dispatch({ type: 'setIntention', wishId: null })}>
              changer
            </button>
          </div>
        ) : wishes.length ? (
          <>
            <p className="hint">Quel souhait veux-tu garder en tête aujourd'hui ?</p>
            <div className="chips">
              {wishes.map((w) => (
                <button key={w.id} className="chip" onClick={() => dispatch({ type: 'setIntention', wishId: w.id })}>
                  {w.title}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="hint">Pose un souhait dans « Mes intentions » pour le faire vivre ici.</p>
        )}
      </section>

      {/* — Défi de choix — */}
      <section className="panel challenge">
        <h2 className="panel-title">🔀 Le défi de choix du jour</h2>
        <div className="challenge-body">
          <span className="challenge-icon">{challenge.icon}</span>
          <span className="challenge-label">{challenge.label}</span>
        </div>
        {challengeDone ? (
          <div className="challenge-done">Relevé aujourd'hui ✓</div>
        ) : (
          <button
            className="primary wide"
            onClick={() => dispatch({ type: 'acceptChallenge', challengeId: challenge.id, label: challenge.label })}
          >
            Je relève le défi
          </button>
        )}
      </section>

      {/* — Tes pas du jour (obligations) — */}
      <section className="panel">
        <h2 className="panel-title">Tes pas du jour</h2>
        <AddTask taskType="todo" />
        {openTodos.length ? (
          <div className="stack">
            {openTodos.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        ) : (
          <p className="hint">Rien à faire d'imposé. Ajoute une chose, puis choisis de l'avancer.</p>
        )}
      </section>

      {/* — En mouvement (2 min + capture) — */}
      <TwoMinTimer />

      <section className="panel">
        <h2 className="panel-title">Capture éclair</h2>
        <div className="kind-row">
          {KINDS.map((k) => (
            <button key={k.id} className={`kind ${kind === k.id ? 'active' : ''}`} onClick={() => setKind(k.id)}>
              {k.label}
            </button>
          ))}
        </div>
        <form className="add-task" onSubmit={addCapture}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={KINDS.find((k) => k.id === kind).hint} />
          <button className="primary" type="submit">
            Noter
          </button>
        </form>
        {todayCaptures.length > 0 && (
          <div className="stack" style={{ marginTop: 12 }}>
            {todayCaptures.map((c) => (
              <div key={c.id} className={`card capture k-${c.kind}`}>
                <span className="capture-text">{c.content}</span>
                <button className="ghost del" onClick={() => dispatch({ type: 'deleteCapture', id: c.id })}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* — Bilan du soir — */}
      <section className="panel">
        <h2 className="panel-title">🌙 Le bilan du soir</h2>
        {accomplished.length ? (
          <ul className="done-list">
            {accomplished.map((t, i) => (
              <li key={i}>✓ {t}</li>
            ))}
          </ul>
        ) : (
          <p className="hint">Ce que tu fais aujourd'hui apparaîtra ici — même une petite chose compte.</p>
        )}
        <textarea
          rows={2}
          value={noticed}
          onChange={(e) => setNoticed(e.target.value)}
          placeholder="Qu'as-tu ressenti, remarqué aujourd'hui ?"
          style={{ marginTop: 12 }}
        />
        <div className="mood-row">
          <span className="hint">Ma journée :</span>
          {MOODS.map((m) => (
            <button key={m} className={`mood ${mood === m ? 'active' : ''}`} onClick={() => setMood(m)}>
              {m}
            </button>
          ))}
        </div>
        <button className="primary wide" onClick={() => dispatch({ type: 'saveReview', noticed, mood })}>
          {existingReview ? 'Mettre à jour mon bilan' : 'Clore ma journée'}
        </button>
        {existingReview && <p className="saved-note">Bilan enregistré ✓ — 🔥 streak en cours.</p>}
      </section>
    </div>
  )
}
