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

## Configuration (variables d'environnement)

Voir [`.env.example`](.env.example). En local, copie-le en `.env.local`. En prod,
déclare les mêmes clés dans **Vercel → Settings → Environment Variables**.

| Variable | Rôle |
|---|---|
| `VITE_SUPABASE_URL` | URL du projet Supabase (défaut intégré si absente) |
| `VITE_SUPABASE_KEY` | Clé publique Supabase — sécurité assurée par les RLS |
| `VITE_N8N_WEBHOOK_URL` | URL du webhook n8n du Coach. Si définie, l'app l'utilise et **masque** le champ de saisie de l'onglet Coach |

⚠️ Les variables `VITE_*` sont **intégrées au bundle client** : elles sortent la config
du code source, mais ne sont pas secrètes. La sécurité réelle est côté serveur
(RLS Supabase, règles du webhook n8n : CORS restreint à ton domaine, éventuel token,
ou proxy serveur).

### Déclarer le webhook dans Vercel
1. Vercel → projet **pense-malin** → **Settings → Environment Variables**.
2. **Add** : `VITE_N8N_WEBHOOK_URL` = l'URL de prod de ton webhook, pour **Production**
   *et* **Preview**.
3. **Redeploy** (les variables Vite sont lues au moment du build).
4. Dans l'app, onglet 🧭 Coach : le champ « Adresse du coach » disparaît — l'URL vient
   désormais de l'environnement.
