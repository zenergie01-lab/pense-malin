import { useEffect, useState } from 'react'
import { useStore } from '../store.jsx'
import { supabase } from '../config/supabase.js'

// URL du webhook n8n : variable d'env au build, sinon réglée dans l'app (localStorage).
const ENV_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || ''
const LS_KEY = 'pm-webhook-url'

// Mini-rendu Markdown (gras + sauts de ligne), après échappement HTML.
function renderMarkdown(text) {
  const esc = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const html = esc
    .replace(/^\s*[-*]\s+(.*)$/gm, '• $1')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
  return { __html: html }
}

// 🧭 COACH — agent orchestrateur : synthèse du jour + questions à la demande.
export default function Coach() {
  const { state } = useStore()
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState('')
  const [webhookUrl, setWebhookUrl] = useState(ENV_URL || localStorage.getItem(LS_KEY) || '')

  async function loadInsights() {
    setLoading(true)
    const { data, error } = await supabase
      .from('pm_insights')
      .select('id, kind, title, content, created_at')
      .order('created_at', { ascending: false })
      .limit(20)
    if (!error) setInsights(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadInsights()
  }, [])

  function saveWebhook(url) {
    setWebhookUrl(url)
    localStorage.setItem(LS_KEY, url)
  }

  async function ask(e) {
    e.preventDefault()
    if (!question.trim()) return
    if (!webhookUrl) {
      setError("Configure d'abord l'adresse de ton coach (webhook n8n) ci-dessous.")
      return
    }
    setAsking(true)
    setError('')
    setAnswer('')
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), state }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json().catch(() => ({}))
      const text = json.answer || json.output || (typeof json === 'string' ? json : '')
      if (!text) throw new Error('Réponse vide du coach.')
      setAnswer(text)
      // On archive la réponse pour la retrouver dans l'historique.
      await supabase.from('pm_insights').insert({ kind: 'answer', title: question.trim().slice(0, 80), content: text })
      setQuestion('')
      loadInsights()
    } catch (err) {
      setError(`Le coach n'a pas répondu (${err.message}). Vérifie que le workflow n8n est actif.`)
    } finally {
      setAsking(false)
    }
  }

  const daily = insights.find((i) => i.kind === 'daily')
  const history = insights.filter((i) => i.id !== daily?.id)

  return (
    <div className="view">
      <header className="view-head">
        <p className="eyebrow">Ton coach</p>
        <h1>Le Coach</h1>
        <p className="lead">Un regard sur tes journées : ce qui avance, ce qui relie, ce qui appelle.</p>
      </header>

      <section className="panel">
        <h2 className="panel-title">✦ Synthèse du jour</h2>
        {loading ? (
          <p className="hint">Chargement…</p>
        ) : daily ? (
          <div className="coach-text" dangerouslySetInnerHTML={renderMarkdown(daily.content)} />
        ) : (
          <p className="hint">
            Pas encore de synthèse. Elle se génère chaque soir une fois ton coach n8n branché, ou pose-lui une question
            ci-dessous.
          </p>
        )}
      </section>

      <section className="panel">
        <h2 className="panel-title">Demander au coach</h2>
        <form className="add-task" onSubmit={ask}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Où en est mon projet ? Résume ma semaine…"
          />
          <button className="primary" type="submit" disabled={asking}>
            {asking ? '…' : 'Demander'}
          </button>
        </form>
        {error && <p className="coach-error">{error}</p>}
        {answer && <div className="card coach-answer" dangerouslySetInnerHTML={renderMarkdown(answer)} />}
      </section>

      {history.length > 0 && (
        <section className="panel">
          <h2 className="panel-title">Historique</h2>
          <div className="stack">
            {history.map((i) => (
              <div key={i.id} className="card coach-item">
                <div className="coach-item-head">
                  <span className={`tag ${i.kind === 'daily' ? 'tag-choice' : ''}`}>
                    {i.kind === 'daily' ? 'synthèse' : i.title || 'réponse'}
                  </span>
                  <span className="coach-date">{i.created_at?.slice(0, 10)}</span>
                </div>
                <div className="coach-text" dangerouslySetInnerHTML={renderMarkdown(i.content)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {!ENV_URL && (
        <section className="panel">
          <h2 className="panel-title">⚙️ Adresse du coach (webhook n8n)</h2>
          <p className="hint">Colle ici l'URL de production du webhook de ton workflow n8n.</p>
          <input
            value={webhookUrl}
            onChange={(e) => saveWebhook(e.target.value)}
            placeholder="https://ton-n8n…/webhook/pense-malin-coach"
          />
        </section>
      )}
    </div>
  )
}
