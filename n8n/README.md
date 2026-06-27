# Coach Pense Malin — workflow n8n

Agent orchestrateur qui analyse tes données Pense Malin : **synthèse quotidienne**
automatique + **réponses à la demande**. Tourne sur ton n8n auto-hébergé, via
**OpenRouter** (tu choisis le modèle : Claude, GPT…).

## Contenu

`pense-malin-coach.workflow.json` — un workflow, deux flux :

| Flux | Déclencheur | Rôle |
|------|-------------|------|
| **Réponse à la demande** | `Webhook Coach` (POST) | reçoit `{ question, state }`, l'agent répond, renvoie `{ answer }` |
| **Synthèse du soir** | `Chaque soir 21h` (cron) | lit `app_state` dans Supabase, l'agent résume la journée, écrit dans `pm_insights` |

## Installation (≈ 5 min)

### 1. Importer
n8n → **Workflows → Import from File** → choisis `pense-malin-coach.workflow.json`.

### 2. Credential OpenRouter
- Crée une clé sur https://openrouter.ai/keys
- Sur les deux nœuds **« Modèle (OpenRouter) »**, ajoute une credential *OpenRouter API* avec ta clé.
- Choisis le modèle dans le champ **Model** (ex. `anthropic/claude-3.7-sonnet` pour les réponses, un modèle plus léger comme `anthropic/claude-3.5-haiku` pour la synthèse).

### 3. Credential Supabase (pour le flux du soir)
- Dans Supabase → **Project Settings → API** : copie l'**URL du projet** et la clé **`service_role`** (secrète — elle reste dans n8n, jamais dans l'app).
- Sur les nœuds **« Lire les états »** et **« Enregistrer la synthèse »**, ajoute une credential *Supabase API* (Host = l'URL, Service Role Secret = la clé).

### 4. Activer
Active le workflow (toggle en haut à droite). Le webhook passe en mode *production*.

### 5. Brancher l'app
- Ouvre le nœud **« Webhook Coach »**, copie l'**URL de production** (`https://ton-n8n/webhook/pense-malin-coach`).
- Dans l'app Pense Malin → onglet **🧭 Coach** → colle l'URL dans **« Adresse du coach »**.
  (Ou définis la variable d'env `VITE_N8N_WEBHOOK_URL` au build pour la figer.)

## Test
Onglet Coach → pose une question (« Résume ma semaine »). Si le workflow est actif et
les credentials OK, la réponse s'affiche et s'archive dans l'historique.

## Notes
- Le projet Supabase gratuit se met en pause après ~7 j d'inactivité : pour que la
  synthèse du soir tourne, le projet doit être actif.
- Les données restent privées : le flux à la demande ne reçoit que l'état envoyé par
  l'app ; le flux du soir lit via la `service_role` (côté serveur, RLS contournée
  uniquement dans ton n8n).
