import { useStore } from '../store.jsx'
import AddTask from '../components/AddTask.jsx'
import TaskCard from '../components/TaskCard.jsx'
import { daysUntil } from '../lib/date.js'

// 🗂️ AGENDA — les deux colonnes qui dialoguent : « À faire » et « Mes souhaits ».
export default function Agenda() {
  const { state } = useStore()
  const todos = state.tasks
    .filter((t) => t.type === 'todo')
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'done' ? 1 : -1
      return (daysUntil(a.deadline) ?? 9999) - (daysUntil(b.deadline) ?? 9999)
    })
  const wishes = state.tasks
    .filter((t) => t.type === 'wish')
    .sort((a, b) => (a.status === b.status ? 0 : a.status === 'done' ? 1 : -1))

  return (
    <div className="view">
      <header className="view-head">
        <p className="eyebrow">Le grand livre</p>
        <h1>Mon agenda vivant</h1>
        <p className="lead">À gauche le devoir, à droite l'envie. Les deux avancent ensemble.</p>
      </header>

      <div className="columns">
        <section className="column">
          <h2 className="col-title todo">À faire</h2>
          <AddTask taskType="todo" />
          <div className="stack">
            {todos.length ? (
              todos.map((t) => <TaskCard key={t.id} task={t} />)
            ) : (
              <p className="hint">Aucune obligation. Ajoute-en une, puis choisis de l'avancer.</p>
            )}
          </div>
        </section>

        <section className="column">
          <h2 className="col-title wish">Mes souhaits</h2>
          <AddTask taskType="wish" />
          <div className="stack">
            {wishes.length ? (
              wishes.map((t) => <TaskCard key={t.id} task={t} />)
            ) : (
              <p className="hint">Une envie, un rêve, une activité à découvrir… pose-la ici.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
