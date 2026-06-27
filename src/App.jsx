import { useState } from 'react'
import { useStore } from './store.jsx'
import Morning from './views/Morning.jsx'
import Day from './views/Day.jsx'
import Evening from './views/Evening.jsx'
import Agenda from './views/Agenda.jsx'
import Projects from './views/Projects.jsx'
import Coach from './views/Coach.jsx'

const TABS = [
  { id: 'morning', icon: '🌅', label: 'Matin', view: Morning },
  { id: 'day', icon: '☀️', label: 'Journée', view: Day },
  { id: 'evening', icon: '🌙', label: 'Soir', view: Evening },
  { id: 'agenda', icon: '🗂️', label: 'Agenda', view: Agenda },
  { id: 'projects', icon: '🌱', label: 'Élan', view: Projects },
  { id: 'coach', icon: '🧭', label: 'Coach', view: Coach },
]

// L'onglet par défaut suit l'heure : matin / journée / soir.
function defaultTab() {
  const h = new Date().getHours()
  if (h < 11) return 'morning'
  if (h < 18) return 'day'
  return 'evening'
}

const SYNC = {
  local: { color: 'var(--muted)', label: 'Local' },
  syncing: { color: 'var(--gold)', label: 'Synchronisation…' },
  synced: { color: 'var(--success)', label: 'Synchronisé' },
  offline: { color: 'var(--muted)', label: 'Hors-ligne (local)' },
}

export default function App() {
  const { state, dispatch, status } = useStore()
  const [tab, setTab] = useState(defaultTab)

  if (!state.profile.pseudo) return <Onboarding onDone={(p) => dispatch({ type: 'setPseudo', pseudo: p })} />

  const ActiveView = TABS.find((t) => t.id === tab).view

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-spark">✦</span> Pense Malin
        </div>
        <div className="score">
          <span
            className="sync-dot"
            title={(SYNC[status] || SYNC.local).label}
            style={{ background: (SYNC[status] || SYNC.local).color }}
          />
          <span className="points" title="Points">
            {state.profile.points} pts
          </span>
          <span className="streak" title="Jours d'affilée">
            🔥 {state.profile.streak}
          </span>
        </div>
      </header>

      <main className="content">
        <ActiveView />
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function Onboarding({ onDone }) {
  const [pseudo, setPseudo] = useState('')
  return (
    <div className="onboard">
      <div className="onboard-card">
        <div className="onboard-spark">✦</div>
        <h1>Pense Malin</h1>
        <p className="onboard-tag">
          Transforme les obligations en choix,
          <br />
          et les pensées en réalité.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (pseudo.trim()) onDone(pseudo.trim())
          }}
        >
          <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Ton pseudo" autoFocus />
          <button className="primary wide" type="submit" disabled={!pseudo.trim()}>
            Commencer
          </button>
        </form>
      </div>
    </div>
  )
}
