import { useState } from 'react'
import { useStore } from '../store.jsx'
import { deadlineLabel, urgency, dateOffset } from '../lib/date.js'

// Carte d'une tâche. Pour une obligation ("todo"), propose de l'AVANCER :
// l'obligation devient un choix, et le choix rapporte des points.
export default function TaskCard({ task }) {
  const { dispatch } = useStore()
  const [choosing, setChoosing] = useState(false)
  const done = task.status === 'done'
  const isWish = task.type === 'wish'

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
          {isWish && <span className="tag tag-wish">souhait</span>}
          {task.deadline && (
            <span className={`tag tag-deadline u-${urgency(task.deadline)}`}>
              ⏳ {deadlineLabel(task.deadline)}
            </span>
          )}
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
      </div>

      <button className="ghost del" aria-label="Supprimer" onClick={() => dispatch({ type: 'deleteTask', id: task.id })}>
        ×
      </button>
    </div>
  )
}
