import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { supabase } from './config/supabase.js'

/**
 * Couche de données de Pense Malin.
 *
 * Pour l'instant tout vit dans localStorage. La forme de l'état et les
 * "actions" ci-dessous sont volontairement découplées de l'UI : le jour où on
 * branche Supabase (multi-comptes, synchro), on remplace `persist()` / le
 * chargement initial par des appels Supabase sans toucher aux composants.
 */

const STORAGE_KEY = 'pense-malin:v1'
const todayStr = () => new Date().toISOString().slice(0, 10)
export const uid = () => Math.random().toString(36).slice(2, 10)

// Points attribués pour chaque geste "malin".
export const POINTS = {
  advance: 20, // avancer une obligation avant sa deadline
  twoMin: 5, // action <2 min faite tout de suite
  review: 10, // revue du soir complétée
  wishDone: 30, // un souhait devenu réalité
  taskDone: 10, // une obligation cochée
  challenge: 10, // défi de choix relevé (sortir de la routine)
}

function emptyState() {
  return {
    profile: { pseudo: '', points: 0, streak: 0, lastReviewDate: null },
    tasks: [], // { id, title, type:'todo'|'wish', deadline, plannedDate, status, advanced, projectId, createdAt }
    captures: [], // { id, content, kind:'idea'|'fact'|'note'|'synchro'|'choix', date, projectId }
    reviews: [], // { date, noticed, mood }
    projects: [], // { id, name, createdAt }
    intentionOfDay: { date: null, wishId: null }, // souhait mis en avant aujourd'hui
    acceptedChallenges: {}, // { 'YYYY-MM-DD': challengeId }
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    return { ...emptyState(), ...JSON.parse(raw) }
  } catch {
    return emptyState()
  }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* quota plein ou mode privé : on ignore silencieusement */
  }
}

function award(profile, amount) {
  return { ...profile, points: Math.max(0, profile.points + amount) }
}

function reducer(state, action) {
  switch (action.type) {
    case 'setPseudo':
      return { ...state, profile: { ...state.profile, pseudo: action.pseudo } }

    case 'addTask': {
      const task = {
        id: uid(),
        title: action.title.trim(),
        type: action.taskType, // 'todo' | 'wish'
        deadline: action.deadline || null,
        plannedDate: null,
        status: 'open',
        advanced: false,
        projectId: null,
        createdAt: new Date().toISOString(),
      }
      if (!task.title) return state
      return { ...state, tasks: [task, ...state.tasks] }
    }

    case 'advanceTask': {
      // Choisir de faire une obligation AVANT sa deadline → +points (une fois).
      const tasks = state.tasks.map((t) =>
        t.id === action.id ? { ...t, plannedDate: action.date, advanced: true } : t,
      )
      const target = state.tasks.find((t) => t.id === action.id)
      const profile = target && !target.advanced ? award(state.profile, POINTS.advance) : state.profile
      return { ...state, tasks, profile }
    }

    case 'toggleTask': {
      const target = state.tasks.find((t) => t.id === action.id)
      if (!target) return state
      const nowDone = target.status !== 'done'
      const tasks = state.tasks.map((t) =>
        t.id === action.id ? { ...t, status: nowDone ? 'done' : 'open', completedAt: nowDone ? new Date().toISOString() : null } : t,
      )
      const gain = target.type === 'wish' ? POINTS.wishDone : POINTS.taskDone
      const profile = award(state.profile, nowDone ? gain : -gain)
      return { ...state, tasks, profile }
    }

    case 'deleteTask':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) }

    case 'setIntention':
      return { ...state, intentionOfDay: { date: todayStr(), wishId: action.wishId } }

    case 'capture': {
      const item = {
        id: uid(),
        content: action.content.trim(),
        kind: action.kind, // 'idea' | 'fact' | 'note' | 'synchro' | 'choix'
        date: new Date().toISOString(),
        projectId: null,
      }
      if (!item.content) return state
      // Une action <2 min loguée comme "fait" récompense le réflexe.
      const profile = action.twoMin ? award(state.profile, POINTS.twoMin) : state.profile
      return { ...state, captures: [item, ...state.captures], profile }
    }

    case 'deleteCapture':
      return { ...state, captures: state.captures.filter((c) => c.id !== action.id) }

    case 'saveReview': {
      const date = todayStr()
      const reviews = [
        { date, noticed: action.noticed || '', mood: action.mood || null },
        ...state.reviews.filter((r) => r.date !== date),
      ]
      // Streak : +1 si la revue d'hier existait, sinon on repart à 1.
      const last = state.profile.lastReviewDate
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      const already = last === date
      const streak = already ? state.profile.streak : last === yesterday ? state.profile.streak + 1 : 1
      const profile = already
        ? state.profile
        : { ...award(state.profile, POINTS.review), streak, lastReviewDate: date }
      return { ...state, reviews, profile }
    }

    case 'addProject': {
      const name = action.name.trim()
      if (!name) return state
      const project = { id: action.id, name, createdAt: new Date().toISOString() }
      return { ...state, projects: [...state.projects, project] }
    }

    case 'assignTask':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, projectId: action.projectId } : t)),
      }

    case 'assignCapture':
      return {
        ...state,
        captures: state.captures.map((c) => (c.id === action.id ? { ...c, projectId: action.projectId } : c)),
      }

    case 'deleteProject':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.id),
        tasks: state.tasks.map((t) => (t.projectId === action.id ? { ...t, projectId: null } : t)),
        captures: state.captures.map((c) => (c.projectId === action.id ? { ...c, projectId: null } : c)),
      }

    case 'acceptChallenge': {
      const date = todayStr()
      if (state.acceptedChallenges[date]) return state // déjà relevé aujourd'hui
      const capture = {
        id: uid(),
        content: `🔀 ${action.label}`,
        kind: 'choix',
        date: new Date().toISOString(),
        projectId: null,
      }
      return {
        ...state,
        acceptedChallenges: { ...state.acceptedChallenges, [date]: action.challengeId },
        captures: [capture, ...state.captures],
        profile: award(state.profile, POINTS.challenge),
      }
    }

    case 'hydrate':
      // Remplace l'état local par celui chargé depuis le cloud.
      return { ...emptyState(), ...action.state }

    case 'reset':
      return emptyState()

    default:
      return state
  }
}

const StoreContext = createContext(null)

// --- Synchronisation cloud (best-effort) ----------------------------------
// L'app reste utilisable même si Supabase est injoignable : on garde toujours
// localStorage comme source immédiate, et on synchronise quand on peut.

async function connect() {
  // Réutilise la session existante, sinon ouvre une session anonyme.
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session?.user) return session.user
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data.user
}

async function loadCloud(userId) {
  const { data, error } = await supabase.from('app_state').select('data').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data?.data ?? null
}

async function saveCloud(userId, state) {
  const { error } = await supabase
    .from('app_state')
    .upsert({ user_id: userId, data: state, updated_at: new Date().toISOString() })
  if (error) throw error
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [status, setStatus] = useState('local') // local | syncing | synced | offline
  const userId = useRef(null)
  const saveTimer = useRef(null)

  // Au démarrage : connexion anonyme + hydratation depuis le cloud si dispo.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setStatus('syncing')
        const user = await connect()
        if (cancelled) return
        userId.current = user.id
        const cloud = await loadCloud(user.id)
        if (cancelled) return
        if (cloud && cloud.profile && cloud.profile.pseudo) {
          dispatch({ type: 'hydrate', state: cloud }) // le cloud fait foi entre sessions
        } else {
          // Pas d'état cloud exploitable (vide/réinitialisé) : on garde le local
          // — qui peut contenir un vrai pseudo — et on le (re)monte vers le cloud.
          await saveCloud(user.id, state)
        }
        setStatus('synced')
      } catch {
        setStatus('offline') // anonyme désactivé, hors-ligne, projet en pause… on reste local
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persistance : localStorage immédiat, puis remontée cloud débouncée.
  useEffect(() => {
    persist(state)
    if (!userId.current) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setStatus('syncing')
      saveCloud(userId.current, state)
        .then(() => setStatus('synced'))
        .catch(() => setStatus('offline'))
    }, 800)
  }, [state])

  const value = useMemo(() => ({ state, dispatch, status }), [state, status])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore doit être utilisé dans <StoreProvider>')
  return ctx
}

// Petits sélecteurs partagés.
export const isToday = (iso) => iso && iso.slice(0, 10) === todayStr()
export { todayStr }
