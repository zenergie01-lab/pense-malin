import { useState } from 'react'
import { useStore, uid } from '../store.jsx'
import { daysUntil } from '../lib/date.js'

// 🌱 ÉLAN — Phase 2 : repérer les projets et suivre leur avancement.
// Chaque tâche faite ou idée capturée, rattachée à un projet, le fait grandir.
export default function Projects() {
  const { state, dispatch } = useStore()
  const [name, setName] = useState('')

  // Contributions = tâches terminées + captures, rattachées au projet.
  const contributionsOf = (pid) => {
    const tasks = state.tasks.filter((t) => t.projectId === pid && t.status === 'done')
    const caps = state.captures.filter((c) => c.projectId === pid)
    const items = [
      ...tasks.map((t) => ({ id: t.id, label: t.title, date: t.completedAt || t.createdAt })),
      ...caps.map((c) => ({ id: c.id, label: c.content, date: c.date })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date))
    return items
  }

  const enriched = state.projects
    .map((p) => {
      const items = contributionsOf(p.id)
      const last = items[0]?.date || p.createdAt
      const daysSince = -(daysUntil(last.slice(0, 10)) ?? 0)
      return { ...p, items, count: items.length, last, daysSince, active: daysSince <= 3 }
    })
    .sort((a, b) => b.count - a.count)

  const maxCount = Math.max(1, ...enriched.map((p) => p.count))

  function add(e) {
    e.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'addProject', id: uid(), name })
    setName('')
  }

  return (
    <div className="view">
      <header className="view-head">
        <p className="eyebrow">Ce qui grandit</p>
        <h1>Mon élan</h1>
        <p className="lead">Ce que tu fais ne se perd pas : ça nourrit quelque chose de plus grand.</p>
      </header>

      <section className="panel">
        <h2 className="panel-title">Nouveau projet</h2>
        <form className="add-task" onSubmit={add}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Un projet, un chantier, un rêve en cours…" />
          <button className="primary" type="submit">
            Créer
          </button>
        </form>
      </section>

      {enriched.length === 0 ? (
        <p className="hint">
          Aucun projet pour l'instant. Crée-en un, puis rattache-lui tes tâches faites et tes idées depuis la revue du
          soir — tu verras l'avancement se construire.
        </p>
      ) : (
        <div className="stack">
          {enriched.map((p) => (
            <section key={p.id} className="panel project">
              <div className="project-head">
                <h2 className="project-name">{p.name}</h2>
                <span className={`badge ${p.active ? 'active' : 'paused'}`}>{p.active ? 'actif' : 'en pause'}</span>
                <button className="ghost del" onClick={() => dispatch({ type: 'deleteProject', id: p.id })}>
                  ×
                </button>
              </div>

              <div className="project-bar">
                <div className="project-fill" style={{ width: `${(p.count / maxCount) * 100}%` }} />
              </div>
              <div className="project-stats">
                <span>
                  <strong>{p.count}</strong> contribution{p.count > 1 ? 's' : ''}
                </span>
                <span>
                  {p.count === 0
                    ? 'à démarrer'
                    : p.daysSince === 0
                      ? "actif aujourd'hui"
                      : `il y a ${p.daysSince} j`}
                </span>
              </div>

              {p.items.length > 0 && (
                <ul className="project-items">
                  {p.items.slice(0, 4).map((it) => (
                    <li key={it.id}>· {it.label}</li>
                  ))}
                  {p.items.length > 4 && <li className="more">+ {p.items.length - 4} autre(s)</li>}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
