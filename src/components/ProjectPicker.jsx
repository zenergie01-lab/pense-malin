import { useState } from 'react'
import { useStore, uid } from '../store.jsx'

// Petit sélecteur : rattacher un élément à un projet, ou en créer un à la volée.
export default function ProjectPicker({ value, onAssign }) {
  const { state, dispatch } = useStore()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  function create() {
    const trimmed = name.trim()
    if (!trimmed) return
    const id = uid()
    dispatch({ type: 'addProject', id, name: trimmed })
    onAssign(id)
    setName('')
    setCreating(false)
  }

  if (creating) {
    return (
      <div className="picker creating">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du projet"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && create()}
        />
        <button className="picker-ok" onClick={create}>
          ✓
        </button>
        <button className="picker-cancel" onClick={() => setCreating(false)}>
          ×
        </button>
      </div>
    )
  }

  return (
    <select
      className="picker"
      value={value || ''}
      onChange={(e) => {
        if (e.target.value === '__new__') setCreating(true)
        else onAssign(e.target.value || null)
      }}
    >
      <option value="">— projet —</option>
      {state.projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
      <option value="__new__">➕ Nouveau projet…</option>
    </select>
  )
}
