import { useState } from 'react'
import { useStore, isToday, todayStr } from '../store.jsx'
import ProjectPicker from '../components/ProjectPicker.jsx'

const MOODS = ['🌑', '🌘', '🌗', '🌖', '🌕']

// 🌙 SOIR — la revue qui donne du sens : ce qu'on a fait, ce qu'on a remarqué.
export default function Evening() {
  const { state, dispatch } = useStore()
  const existing = state.reviews.find((r) => r.date === todayStr())
  const [noticed, setNoticed] = useState(existing?.noticed ?? '')
  const [mood, setMood] = useState(existing?.mood ?? null)

  // Tout ce qui a été accompli aujourd'hui : tâches cochées + captures "fait".
  const doneTasks = state.tasks.filter((t) => t.status === 'done' && isToday(t.completedAt))
  const facts = state.captures.filter((c) => c.kind === 'fact' && isToday(c.date))
  const synchros = state.captures.filter((c) => c.kind === 'synchro' && isToday(c.date))
  const accomplished = [
    ...doneTasks.map((t) => ({ id: t.id, label: t.title, type: 'task', projectId: t.projectId })),
    ...facts.map((c) => ({ id: c.id, label: c.content, type: 'capture', projectId: c.projectId })),
  ]

  function assign(item, projectId) {
    dispatch({ type: item.type === 'task' ? 'assignTask' : 'assignCapture', id: item.id, projectId })
  }

  function save() {
    dispatch({ type: 'saveReview', noticed, mood })
  }

  return (
    <div className="view">
      <header className="view-head">
        <p className="eyebrow">Le retour</p>
        <h1>Le bilan du soir</h1>
        <p className="lead">Ce que tu as fait existe. Nomme-le, et vois ce qui se construit.</p>
      </header>

      <section className="panel">
        <h2 className="panel-title">Ce que j'ai accompli ({accomplished.length})</h2>
        {accomplished.length ? (
          <>
            <p className="hint">Rattache chaque pas à un projet pour voir ton élan grandir.</p>
            <ul className="done-list">
              {accomplished.map((item) => (
                <li key={item.id} className="done-row">
                  <span className="done-label">✓ {item.label}</span>
                  <ProjectPicker value={item.projectId} onAssign={(pid) => assign(item, pid)} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="hint">Même une petite chose compte. Coche une tâche ou note un “fait” dans la journée.</p>
        )}
      </section>

      {synchros.length > 0 && (
        <section className="panel">
          <h2 className="panel-title">✦ Ce que j'ai remarqué</h2>
          <ul className="done-list">
            {synchros.map((c) => (
              <li key={c.id}>{c.content}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel">
        <h2 className="panel-title">Qu'as-tu ressenti, entendu en toi ?</h2>
        <textarea
          rows={3}
          value={noticed}
          onChange={(e) => setNoticed(e.target.value)}
          placeholder="Une intuition, une synchronicité, une gratitude…"
        />
        <div className="mood-row">
          <span className="hint">Ma journée :</span>
          {MOODS.map((m) => (
            <button key={m} className={`mood ${mood === m ? 'active' : ''}`} onClick={() => setMood(m)}>
              {m}
            </button>
          ))}
        </div>
        <button className="primary wide" onClick={save}>
          {existing ? 'Mettre à jour' : 'Clore ma journée (+10)'}
        </button>
        {existing && <p className="saved-note">Revue enregistrée ✓ — streak en cours.</p>}
      </section>
    </div>
  )
}
