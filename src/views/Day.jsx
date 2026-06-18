import { useState } from 'react'
import { useStore, isToday } from '../store.jsx'
import TwoMinTimer from '../components/TwoMinTimer.jsx'
import { todaySeed } from '../lib/challenges.js'

const KINDS = [
  { id: 'idea', label: '💡 Idée', hint: 'à développer' },
  { id: 'fact', label: '✓ Fait', hint: 'je viens de faire' },
  { id: 'synchro', label: '✦ Remarqué', hint: 'signe / ressenti' },
  { id: 'note', label: '📝 Note', hint: 'en vrac' },
]

// ☀️ JOURNÉE — capture éclair, règle des 2 min, et ce qu'on a remarqué.
export default function Day() {
  const { state, dispatch } = useStore()
  const [kind, setKind] = useState('idea')
  const [text, setText] = useState('')

  const intentionWish = state.tasks.find((t) => t.id === state.intentionOfDay.wishId)
  const todayCaptures = state.captures.filter((c) => isToday(c.date))

  function add(e) {
    e.preventDefault()
    if (!text.trim()) return
    dispatch({ type: 'capture', content: text, kind })
    setText('')
  }

  return (
    <div className="view">
      <header className="view-head">
        <p className="eyebrow">Plein jour</p>
        <h1>En mouvement</h1>
        <p className="lead">
          Si l'idée du <em>comment</em> vient dans l'action : agis, ne réfléchis pas.
        </p>
      </header>

      {intentionWish && (
        <div className="intention-banner">
          <div>
            <span className="spark">✦</span> Aujourd'hui, je garde en tête : <strong>{intentionWish.title}</strong>
          </div>
          <p className="seed">{todaySeed()}</p>
          <button className="sign-btn" onClick={() => setKind('synchro')}>
            ✦ Noter un signe
          </button>
        </div>
      )}

      <TwoMinTimer />

      <section className="panel">
        <h2 className="panel-title">Capture éclair</h2>
        <div className="kind-row">
          {KINDS.map((k) => (
            <button
              key={k.id}
              className={`kind ${kind === k.id ? 'active' : ''}`}
              onClick={() => setKind(k.id)}
              title={k.hint}
            >
              {k.label}
            </button>
          ))}
        </div>
        <form className="add-task" onSubmit={add}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={KINDS.find((k) => k.id === kind).hint} />
          <button className="primary" type="submit">
            Noter
          </button>
        </form>
      </section>

      <section className="panel">
        <h2 className="panel-title">Aujourd'hui ({todayCaptures.length})</h2>
        {todayCaptures.length ? (
          <div className="stack">
            {todayCaptures.map((c) => (
              <div key={c.id} className={`card capture k-${c.kind}`}>
                <span className="capture-text">{c.content}</span>
                <button className="ghost del" onClick={() => dispatch({ type: 'deleteCapture', id: c.id })}>
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="hint">Rien encore. La moindre idée mérite d'être attrapée avant qu'elle file.</p>
        )}
      </section>
    </div>
  )
}
