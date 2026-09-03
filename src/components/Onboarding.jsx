import { useState } from 'react'
import { HORIZONS } from '../lib/date.js'

// Phase B — accueil "vendeur" : la promesse, le principe, puis un premier
// geste guidé (poser sa première intention) pour ressentir la valeur tout de suite.
export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [pseudo, setPseudo] = useState('')
  const [intention, setIntention] = useState('')
  const [horizon, setHorizon] = useState('1an')

  function finish(e) {
    e?.preventDefault()
    if (!pseudo.trim()) return
    onDone({ pseudo: pseudo.trim(), intention: intention.trim(), horizon })
  }

  return (
    <div className="onboard">
      <div className="onboard-card">
        {step === 0 && (
          <div className="ob-step">
            <div className="onboard-spark">✦</div>
            <h1>Pense Malin</h1>
            <p className="onboard-tag">
              Transforme tes obligations en choix,
              <br />
              et tes pensées en réalité.
            </p>
            <ul className="ob-points">
              <li>
                <span>🎯</span> Pose ton cap : ce que tu veux voir devenir réel.
              </li>
              <li>
                <span>🚶</span> Chaque jour, un petit pas choisi vers lui.
              </li>
              <li>
                <span>🧭</span> Un coach qui veille sur ton avancement.
              </li>
            </ul>
            <button className="primary wide" onClick={() => setStep(1)}>
              Commencer
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="ob-step">
            <p className="eyebrow">Le principe</p>
            <h2 className="ob-title">T'orienter vers ton cap</h2>
            <p className="ob-text">
              La plupart des agendas listent ce qu'il « faut » faire. Ici, tu choisis d'abord <strong>où tu vas</strong>{' '}
              — tes intentions — puis chaque obligation devient un <strong>petit pas</strong> vers elles. Tu remarques
              les signes qui les rapprochent. Tu ne subis plus : <strong>tu manifestes</strong>.
            </p>
            <button className="primary wide" onClick={() => setStep(2)}>
              J'ai compris
            </button>
            <button className="link-btn ob-back" onClick={() => setStep(0)}>
              retour
            </button>
          </div>
        )}

        {step === 2 && (
          <form className="ob-step" onSubmit={finish}>
            <p className="eyebrow">On commence</p>
            <h2 className="ob-title">Ta première intention</h2>
            <p className="ob-text">Qu'aimerais-tu voir devenir réel dans ta vie ?</p>
            <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Ton prénom ou pseudo" autoFocus />
            <input
              className="ob-gap"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="Ex : vivre près de la nature, lancer mon activité…"
            />
            <label className="field ob-gap">
              <span className="field-label">Réel à 100% dans</span>
              <select className="horizon-sel" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                {HORIZONS.map((h) => (
                  <option key={h.key} value={h.key}>
                    {h.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary wide ob-gap" type="submit" disabled={!pseudo.trim()}>
              C'est parti ✦
            </button>
            <p className="ob-skip">Tu pourras en ajouter d'autres ensuite.</p>
          </form>
        )}

        <div className="ob-dots">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`ob-dot ${step === i ? 'active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
