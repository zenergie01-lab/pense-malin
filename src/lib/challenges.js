// Phase 3 — La notion de choix : sortir des habitudes machinales pour
// redonner du goût au quotidien. Un défi par jour, stable toute la journée.
export const CHALLENGES = [
  { id: 'route', icon: '🛣️', label: 'Prends une route différente pour rentrer' },
  { id: 'transport', icon: '🚲', label: 'Change de moyen de transport (vélo, marche, train…)' },
  { id: 'epicerie', icon: '🥕', label: 'Fais tes courses dans une petite épicerie de quartier' },
  { id: 'inconnu', icon: '👋', label: 'Dis bonjour à une personne que tu ne connais pas' },
  { id: 'ciel', icon: '☁️', label: 'Prends 5 minutes pour observer le ciel' },
  { id: 'gout', icon: '🍑', label: "Goûte un aliment que tu n'as jamais essayé" },
  { id: 'chemin', icon: '🚶', label: 'Emprunte un autre chemin à pied' },
  { id: 'silence', icon: '🤫', label: 'Passe 10 minutes sans téléphone, en silence' },
  { id: 'merci', icon: '💛', label: 'Remercie sincèrement quelqu’un aujourd’hui' },
  { id: 'tot', icon: '🌄', label: 'Lève-toi 15 min plus tôt et savoure le calme' },
  { id: 'musique', icon: '🎵', label: 'Écoute un style de musique inhabituel pour toi' },
  { id: 'main', icon: '🛠️', label: 'Fais quelque chose de tes mains (cuisine, bricolage)' },
]

// Petites graines d'intuition pour rester attentif aux synchronicités.
export const SEEDS = [
  'Reste attentif·ve aux signes liés à ton intention aujourd’hui.',
  'Une rencontre, un mot, une image : note ce qui résonne.',
  'Suis ton instinct sur une petite décision, sans réfléchir.',
  'Ce qui attire ton regard aujourd’hui a peut-être quelque chose à te dire.',
  'Écoute la première idée qui te vient : c’est souvent la bonne.',
]

const dayNumber = () => Math.floor(new Date(new Date().toISOString().slice(0, 10)).getTime() / 86400000)

export const todayChallenge = () => CHALLENGES[dayNumber() % CHALLENGES.length]
export const todaySeed = () => SEEDS[dayNumber() % SEEDS.length]
