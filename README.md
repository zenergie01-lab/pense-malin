# Pense Malin

Transforme les obligations en choix, et les pensées en réalité.

Un agenda vivant qui mêle le « à faire » et les souhaits, pour redonner du sens
et du goût au quotidien — prévu comme imprévu.

## Le mini-cycle

- 🌅 **Matin** — pose ton intention du jour, choisis d'avancer tes obligations, relève le défi de choix.
- ☀️ **Journée** — capture éclair, règle des 2 minutes, attention aux signes.
- 🌙 **Soir** — la revue qui donne du sens : ce que tu as fait, ce que tu as remarqué.
- 🗂️ **Agenda** — les deux colonnes qui dialoguent : à faire / mes souhaits.
- 🌱 **Élan** — tes projets et leur avancement.

## Stack

- React + Vite (PWA installable)
- Supabase (auth anonyme + synchro cloud, architecture local-first)
- Typographie : Fraunces · Hanken Grotesk · Spline Sans Mono

## Développement

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # génère dist/
```

## Configuration

Le client Supabase ([`src/config/supabase.js`](src/config/supabase.js)) lit
`VITE_SUPABASE_URL` et `VITE_SUPABASE_KEY` si présents, sinon utilise les valeurs
du projet par défaut (la clé publique peut vivre côté client, la sécurité est
assurée par les politiques RLS).
