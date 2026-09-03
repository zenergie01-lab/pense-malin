import { useStore } from '../store.jsx'
import AddTask from '../components/AddTask.jsx'
import TaskCard from '../components/TaskCard.jsx'
import { todaySeed } from '../lib/challenges.js'

// ② MES INTENTIONS — les souhaits, leur horizon "100% dans …", et les signes
// réels qui les rapprochent (la jauge d'attraction vit dans chaque carte).
export default function Intentions() {
  const { state } = useStore()
  const wishes = state.tasks
    .filter((t) => t.type === 'wish')
    .sort((a, b) => (a.status === b.status ? 0 : a.status === 'done' ? 1 : -1))

  return (
    <div className="view">
      <header className="view-head">
        <p className="eyebrow">Ce que j'attire</p>
        <h1>Mes intentions</h1>
        <p className="lead">Exprime ce que tu veux vivre — puis remarque les signes qui l'annoncent.</p>
      </header>

      <section className="panel">
        <h2 className="panel-title">Poser une intention</h2>
        <AddTask taskType="wish" />
      </section>

      <div className="intention-seed">✦ {todaySeed()}</div>

      <div className="stack">
        {wishes.length ? (
          wishes.map((t) => <TaskCard key={t.id} task={t} />)
        ) : (
          <p className="hint">Un rêve, une envie, une activité à découvrir… pose ta première intention ci-dessus.</p>
        )}
      </div>
    </div>
  )
}
