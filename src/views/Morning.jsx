import { useStore, todayStr } from '../store.jsx'
import TaskCard from '../components/TaskCard.jsx'
import { daysUntil, prettyToday } from '../lib/date.js'
import { todayChallenge } from '../lib/challenges.js'

// 🌅 MATIN — poser l'intention du jour et choisir ce qu'on avance.
export default function Morning() {
  const { state, dispatch } = useStore()
  const { tasks, intentionOfDay } = state

  const challenge = todayChallenge()
  const challengeDone = state.acceptedChallenges[todayStr()] === challenge.id

  // Les obligations ouvertes les plus proches de leur deadline.
  const upcoming = tasks
    .filter((t) => t.type === 'todo' && t.status === 'open')
    .sort((a, b) => (daysUntil(a.deadline) ?? 9999) - (daysUntil(b.deadline) ?? 9999))
    .slice(0, 3)

  const wishes = tasks.filter((t) => t.type === 'wish' && t.status === 'open')
  const chosen = wishes.find((w) => w.id === intentionOfDay.wishId)

  return (
    <div className="view">
      <header className="view-head">
        <p className="eyebrow">{prettyToday()}</p>
        <h1>Ton intention du jour</h1>
        <p className="lead">Décide. Ne subis pas. Choisis trois pas et une envie.</p>
      </header>

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
          <p className="hint">Ajoute un souhait dans l'onglet Agenda pour le faire vivre ici.</p>
        )}
      </section>

      <section className="panel challenge">
        <h2 className="panel-title">🔀 Le défi de choix du jour</h2>
        <div className="challenge-body">
          <span className="challenge-icon">{challenge.icon}</span>
          <span className="challenge-label">{challenge.label}</span>
        </div>
        <p className="hint">Sors de l'automatisme : le normal est devenu banal, et chaque choix réveille le goût.</p>
        {challengeDone ? (
          <div className="challenge-done">Relevé aujourd'hui ✓ — +{10} points d'audace</div>
        ) : (
          <button
            className="primary wide"
            onClick={() => dispatch({ type: 'acceptChallenge', challengeId: challenge.id, label: challenge.label })}
          >
            Je relève le défi (+10)
          </button>
        )}
      </section>

      <section className="panel">
        <h2 className="panel-title">Ce qui approche</h2>
        {upcoming.length ? (
          <div className="stack">
            {upcoming.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        ) : (
          <p className="hint">Rien d'urgent. Profite, ou ajoute une chose à faire dans l'Agenda.</p>
        )}
      </section>
    </div>
  )
}
