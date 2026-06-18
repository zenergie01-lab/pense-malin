import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store.jsx'

const TOTAL = 120 // 2 minutes, en secondes

// La règle des 2 minutes, matérialisée : un appel, un message, un rangement…
// Si ça prend moins de 2 min, on le fait MAINTENANT. Réflexe récompensé.
export default function TwoMinTimer() {
  const { dispatch } = useStore()
  const [label, setLabel] = useState('')
  const [left, setLeft] = useState(TOTAL)
  const [running, setRunning] = useState(false)
  const tick = useRef(null)

  useEffect(() => {
    if (!running) return
    tick.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(tick.current)
          setRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(tick.current)
  }, [running])

  function start() {
    if (!label.trim()) return
    setLeft(TOTAL)
    setRunning(true)
  }

  function done() {
    clearInterval(tick.current)
    setRunning(false)
    dispatch({ type: 'capture', content: `⚡ ${label.trim()}`, kind: 'fact', twoMin: true })
    setLabel('')
    setLeft(TOTAL)
  }

  const mm = String(Math.floor(left / 60)).padStart(1, '0')
  const ss = String(left % 60).padStart(2, '0')
  const pct = (left / TOTAL) * 100

  return (
    <div className="card two-min">
      <div className="two-min-head">
        <span className="bolt">⚡</span>
        <div>
          <div className="two-min-title">Moins de 2 minutes ?</div>
          <div className="two-min-sub">Un appel, un message… fais-le tout de suite.</div>
        </div>
      </div>

      {!running ? (
        <div className="two-min-start">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Quoi ? (ex : rappeler Marie)"
            onKeyDown={(e) => e.key === 'Enter' && start()}
          />
          <button className="primary" onClick={start} disabled={!label.trim()}>
            Lancer 2:00
          </button>
        </div>
      ) : (
        <div className="two-min-run">
          <div className="timer-num">
            {mm}:{ss}
          </div>
          <div className="timer-bar">
            <div className="timer-fill" style={{ width: `${pct}%` }} />
          </div>
          <button className="success" onClick={done}>
            C'est fait ✓ (+5)
          </button>
        </div>
      )}
    </div>
  )
}
