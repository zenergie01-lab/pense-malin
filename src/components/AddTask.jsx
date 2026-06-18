import { useState } from 'react'
import { useStore } from '../store.jsx'

// Saisie rapide d'une obligation (avec deadline) ou d'un souhait.
export default function AddTask({ taskType }) {
  const { dispatch } = useStore()
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const isWish = taskType === 'wish'

  function submit(e) {
    e.preventDefault()
    dispatch({ type: 'addTask', title, taskType, deadline: isWish ? null : deadline })
    setTitle('')
    setDeadline('')
  }

  return (
    <form className="add-task" onSubmit={submit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={isWish ? 'Un souhait, une envie…' : 'Une chose à faire…'}
      />
      {!isWish && (
        <input
          className="date-in"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          title="Date butoir (optionnel)"
        />
      )}
      <button className="primary" type="submit">
        Ajouter
      </button>
    </form>
  )
}
