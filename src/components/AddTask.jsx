import { useState } from 'react'
import { useStore } from '../store.jsx'
import { HORIZONS } from '../lib/date.js'

// Saisie rapide d'une obligation (date + heure de rdv) ou d'un souhait (horizon).
export default function AddTask({ taskType }) {
  const { dispatch } = useStore()
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [time, setTime] = useState('')
  const [horizon, setHorizon] = useState('1an')
  const isWish = taskType === 'wish'

  function submit(e) {
    e.preventDefault()
    dispatch({
      type: 'addTask',
      title,
      taskType,
      deadline: isWish ? null : deadline,
      time: isWish ? null : time,
      horizon: isWish ? horizon : null,
    })
    setTitle('')
    setDeadline('')
    setTime('')
  }

  return (
    <form className="add-task" onSubmit={submit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={isWish ? 'Un souhait, une envie…' : 'Une chose à faire…'}
      />
      <div className="add-row">
        {isWish ? (
          <label className="field">
            <span className="field-label">Réel à 100% dans</span>
            <select className="horizon-sel" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
              {HORIZONS.map((h) => (
                <option key={h.key} value={h.key}>
                  {h.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <input
              className="date-in"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              title="Date butoir (optionnel)"
            />
            <input
              className="time-in"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              title="Heure du rendez-vous (optionnel)"
            />
          </>
        )}
        <button className="primary" type="submit">
          Ajouter
        </button>
      </div>
    </form>
  )
}
