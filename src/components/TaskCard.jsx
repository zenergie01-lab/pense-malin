import { useState } from 'react'
import { useStore } from '../store.jsx'
import { deadlineLabel, urgency, dateOffset, horizonLabel } from '../lib/date.js'

// Carte d'une tâche.
// - Obligation ("todo") : date + heure de rdv, et l'option de l'AVANCER (le devoir
//   devient un choix, qui rapporte des points).
// - Souhait ("wish") : un horizon "100% dans …", et les petits signes réels qu'on
//   remarque et qui attirent peu à peu cette réalité.
export default function TaskCard({ task }) {
  const { dispatch } = useStore()
  const [choosing, setChoosing] = useState(false)
  const [sign, setSign] = useState('')
  const done = task.status === 'done'
  const isWish = task.type === 'wish'
  const signs = task.signs || []
  const attraction = Math.min(100, signs.length * 12)

  function addSign(e) {
    e.preventDefault()
    if (!sign.trim()) return
    dispatch({ type: 'addSign', id: task.id, text: sign })
    setSign('')
  }

  return (
    <div className={`card task ${done ? 'is-done' : ''} ${isWish ? 'is-wish' : ''}`}>
      <button
        className="check"
        aria-label={done ? 'Rouvrir' : 'Terminer'}
        onClick={() => dispatch({ type: 'toggleTask', id: task.id })}
      >
        {done ? '✓' : ''}
      </button>

      <div className="task-body">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          {isWish && task.horizon && (
            <span className="tag tag-horizon">✦ 100% dans {horizonLabel(task.horizon)}</span>
          )}
          {!isWish && task.deadline && (
            <span className={`tag tag-deadline u-${urgency(task.deadline)}`}>⏳ {deadlineLabel(task.deadline)}</span>
          )}
          {!isWish && task.time && <span className="tag tag-time">⏰ {task.time}</span>}
          {task.plannedDate && task.advanced && (
            <span className="tag tag-choice">✦ choisi : {deadlineLabel(task.plannedDate)}</span>
          )}
        </div>

        {!done && !isWish && task.deadline && !task.advanced && (
          <div className="advance">
            {!choosing ? (
              <button className="link-btn" onClick={() => setChoosing(true)}>
                Et si tu l'avançais ? ✦
              </button>
            ) : (
              <div className="advance-options">
                <span className="advance-q">Je choisis de le faire :</span>
                <button onClick={() => dispatch({ type: 'advanceTask', id: task.id, date: dateOffset(0) })}>
                  aujourd'hui
                </button>
                <button onClick={() => dispatch({ type: 'advanceTask', id: task.id, date: dateOffset(1) })}>
                  demain
                </button>
                <button onClick={() => dispatch({ type: 'advanceTask', id: task.id, date: dateOffset(2) })}>
                  après-demain
                </button>
              </div>
            )}
          </div>
        )}

        {!done && isWish && (
          <div className="signs">
            <div className="attraction-bar" title={`${signs.length} signe(s)`}>
              <div className="attraction-fill" style={{ width: `${attraction}%` }} />
            </div>
            <div className="attraction-label">
              {signs.length === 0
                ? "Reste attentif·ve aux signes qui l'annoncent…"
                : `${signs.length} signe${signs.length > 1 ? 's' : ''} remarqué${signs.length > 1 ? 's' : ''} · ça se rapproche`}
            </div>
            <form className="add-sign" onSubmit={addSign}>
              <input
                value={sign}
                onChange={(e) => setSign(e.target.value)}
                placeholder="Un signe réel et significatif que j'ai remarqué…"
              />
              <button className="sign-add" type="submit" title="Noter ce signe (+3)">
                ✦
              </button>
            </form>
            {signs.length > 0 && (
              <ul className="sign-list">
                {signs.slice(0, 3).map((s) => (
                  <li key={s.id}>✦ {s.text}</li>
                ))}
                {signs.length > 3 && <li className="more">+ {signs.length - 3} autre(s)</li>}
              </ul>
            )}
          </div>
        )}
      </div>

      <button className="ghost del" aria-label="Supprimer" onClick={() => dispatch({ type: 'deleteTask', id: task.id })}>
        ×
      </button>
    </div>
  )
}
